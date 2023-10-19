import { ethers } from 'ethers';
import assert from 'assert';
import { DuplicateAddressesError, InvalidAddressError, InvalidMaxHopsError, InvalidSlippageError } from 'errors';
import { fetchGasPrice } from 'lib/transactionUtils/gas';
import { getApproval, prepareApproval } from 'lib/transactionUtils/approval';
import { SecondaryFee__factory } from 'contracts/types';
import { NativeTokenService } from 'lib/nativeTokenService';
import { Quote } from 'lib/quote/base';
import { TradeRequest } from 'lib/tradeRequest/base';
import { ExactInput } from 'lib/tradeRequest/exactInput';
import { ExactOutput } from 'lib/tradeRequest/exactOutput';
import { DEFAULT_DEADLINE, DEFAULT_MAX_HOPS, DEFAULT_SLIPPAGE, MAX_MAX_HOPS, MIN_MAX_HOPS } from './constants';
import { Router } from './lib/router';
import { getERC20Decimals, isValidNonZeroAddress, newAmount, toPublicAmount } from './lib/utils';
import { Coin, ERC20, ExchangeModuleConfiguration, PublicQuote, SecondaryFee, TransactionResponse } from './types';
import { getSwap } from './lib/transactionUtils/swap';
import { ExchangeConfiguration } from './config';

const toPublicQuote = (quote: Quote): PublicQuote => ({
  amount: toPublicAmount(quote.quotedAmount),
  amountWithMaxSlippage: quote.amountWithMaxSlippage,
  slippage: quote.slippagePercentage,
  fees: quote.secondaryFees.map((fee) => ({
    ...fee,
    amount: toPublicAmount(fee.amount),
  })),
});

export class Exchange {
  private provider: ethers.providers.JsonRpcProvider;

  private router: Router;

  private chainId: number;

  private nativeToken: Coin;

  private wrappedNativeToken: ERC20;

  private secondaryFees: SecondaryFee[];

  private nativeTokenService: NativeTokenService;

  private secondaryFeeContractAddress: string;

  private routerContractAddress: string;

  constructor(configuration: ExchangeModuleConfiguration) {
    const config = new ExchangeConfiguration(configuration);

    this.chainId = config.chain.chainId;
    this.nativeToken = config.chain.nativeToken;
    this.wrappedNativeToken = config.chain.wrappedNativeToken;
    this.nativeTokenService = new NativeTokenService(this.nativeToken, this.wrappedNativeToken);
    this.secondaryFees = config.secondaryFees;
    this.routerContractAddress = config.chain.contracts.peripheryRouter;
    this.secondaryFeeContractAddress = config.chain.contracts.secondaryFee;

    this.provider = new ethers.providers.JsonRpcProvider(config.chain.rpcUrl);

    this.router = new Router(this.provider, config.chain.commonRoutingTokens, {
      multicallAddress: config.chain.contracts.multicall,
      factoryAddress: config.chain.contracts.coreFactory,
      quoterAddress: config.chain.contracts.quoterV2,
    });
  }

  private static validate(
    tokenInAddress: string,
    tokenOutAddress: string,
    maxHops: number,
    slippagePercent: number,
    fromAddress: string,
  ) {
    assert(isValidNonZeroAddress(fromAddress), new InvalidAddressError('invalid from address'));
    assert(isValidNonZeroAddress(tokenInAddress), new InvalidAddressError('invalid token in address'));
    assert(isValidNonZeroAddress(tokenOutAddress), new InvalidAddressError('invalid token out address'));
    assert(tokenInAddress.toLocaleLowerCase() !== tokenOutAddress.toLocaleLowerCase(), new DuplicateAddressesError());
    assert(maxHops <= MAX_MAX_HOPS, new InvalidMaxHopsError('max hops must be less than or equal to 10'));
    assert(maxHops >= MIN_MAX_HOPS, new InvalidMaxHopsError('max hops must be greater than or equal to 1'));
    assert(slippagePercent <= 50, new InvalidSlippageError('slippage percent must be less than or equal to 50'));
    assert(slippagePercent >= 0, new InvalidSlippageError('slippage percent must be greater than or equal to 0'));
  }

  private async getSecondaryFees() {
    if (this.secondaryFees.length === 0) {
      return [];
    }

    const secondaryFeeContract = SecondaryFee__factory.connect(this.secondaryFeeContractAddress, this.provider);

    if (await secondaryFeeContract.paused()) {
      // Do not use secondary fees if the contract is paused
      return [];
    }

    return this.secondaryFees;
  }

  private async getUnsignedSwapTx(
    fromAddress: string,
    tradeRequest: TradeRequest,
    deadline: number,
  ): Promise<TransactionResponse> {
    Exchange.validate(
      tradeRequest.tokenIn.address,
      tradeRequest.tokenOut.address,
      tradeRequest.maxHops,
      tradeRequest.slippagePercentage,
      fromAddress,
    );

    // get quote and gas details
    const [quote, gasPrice] = await Promise.all([
      this.router.findOptimalRoute(tradeRequest),
      fetchGasPrice(this.provider, this.nativeToken),
    ]);

    const swap = getSwap(
      quote,
      fromAddress,
      deadline,
      this.routerContractAddress,
      this.secondaryFeeContractAddress,
      gasPrice,
    );

    const preparedApproval = prepareApproval(quote, {
      routerAddress: this.routerContractAddress,
      secondaryFeeAddress: this.secondaryFeeContractAddress,
    });

    // preparedApproval always uses the tokenIn address because we are always selling the tokenIn
    const approval = await getApproval(this.provider, fromAddress, preparedApproval, gasPrice);

    const publicQuote = toPublicQuote(quote);

    return { quote: publicQuote, approval, swap };
  }

  /**
   * Get the unsigned swap transaction given the amount to sell.
   * Includes quote details for the swap.
   *
   * @param {string} fromAddress The public address that will sign and submit the transaction.
   * @param {string} tokenInAddress Token address to sell.
   * @param {string} tokenOutAddress Token address to buy.
   * @param {ethers.BigNumberish} amountIn Amount to sell.
   * @param {number} slippagePercent (optional) The percentage of slippage tolerance. Default = 0.1. Max = 50. Min = 0.
   * @param {number} maxHops (optional) Maximum hops allowed in optimal route. Default is 2.
   * @param {number} deadline (optional) Latest time swap can execute. Default is 15 minutes.
   * @return {TransactionResponse} The result containing the unsigned transaction and details of the swap.
   */
  public async getUnsignedSwapTxFromAmountIn(
    fromAddress: string,
    tokenInAddress: string,
    tokenOutAddress: string,
    amountIn: ethers.BigNumberish,
    slippagePercent: number = DEFAULT_SLIPPAGE,
    maxHops: number = DEFAULT_MAX_HOPS,
    deadline: number = DEFAULT_DEADLINE,
  ): Promise<TransactionResponse> {
    const tokenIn = {
      type: 'erc20',
      address: tokenInAddress,
      chainId: this.chainId,
      decimals: await getERC20Decimals(tokenInAddress, this.provider),
    } as const;
    const tokenOut = {
      type: 'erc20',
      address: tokenOutAddress,
      chainId: this.chainId,
      decimals: await getERC20Decimals(tokenOutAddress, this.provider),
    } as const;
    const coinAmountIn = newAmount(ethers.BigNumber.from(amountIn), tokenIn);
    const tradeRequest = new ExactInput(
      coinAmountIn,
      tokenOut,
      await this.getSecondaryFees(),
      slippagePercent,
      maxHops,
      this.nativeTokenService,
    );

    return await this.getUnsignedSwapTx(fromAddress, tradeRequest, deadline);
  }

  /**
   * Get the unsigned swap transaction given the amount to buy.
   * Includes quote details for the swap.
   *
   * @param {string} fromAddress The public address that will sign and submit the transaction.
   * @param {string} tokenInAddress Token address to sell.
   * @param {string} tokenOutAddress Token address to buy.
   * @param {ethers.BigNumberish} amountOut Amount to buy.
   * @param {number} slippagePercent (optional) The percentage of slippage tolerance. Default = 0.1. Max = 50. Min = 0.
   * @param {number} maxHops (optional) Maximum hops allowed in optimal route. Default is 2.
   * @param {number} deadline (optional) Latest time swap can execute. Default is 15 minutes.
   * @return {TransactionResponse} The result containing the unsigned transaction and details of the swap.
   */
  public async getUnsignedSwapTxFromAmountOut(
    fromAddress: string,
    tokenInAddress: string,
    tokenOutAddress: string,
    amountOut: ethers.BigNumberish,
    slippagePercent: number = DEFAULT_SLIPPAGE,
    maxHops: number = DEFAULT_MAX_HOPS,
    deadline: number = DEFAULT_DEADLINE,
  ): Promise<TransactionResponse> {
    const tokenIn = {
      type: 'erc20',
      address: tokenInAddress,
      chainId: this.chainId,
      decimals: await getERC20Decimals(tokenInAddress, this.provider),
    } as const;
    const tokenOut = {
      type: 'erc20',
      address: tokenOutAddress,
      chainId: this.chainId,
      decimals: await getERC20Decimals(tokenOutAddress, this.provider),
    } as const;
    const coinAmountOut = newAmount(ethers.BigNumber.from(amountOut), tokenOut);
    const tradeRequest = new ExactOutput(
      coinAmountOut,
      tokenIn,
      await this.getSecondaryFees(),
      slippagePercent,
      maxHops,
      this.nativeTokenService,
    );
    return await this.getUnsignedSwapTx(fromAddress, tradeRequest, deadline);
  }
}
