import { ethers } from 'ethers';
import { TradeType } from '@uniswap/sdk-core';
import assert from 'assert';
import { DuplicateAddressesError, InvalidAddressError, InvalidMaxHopsError, InvalidSlippageError } from 'errors';
import { fetchGasPrice } from 'lib/transactionUtils/gas';
import { getApproval, prepareApproval } from 'lib/transactionUtils/approval';
import { applySlippage, getOurQuoteReqAmount, getQuoteAmountFromTradeType } from 'lib/transactionUtils/getQuote';
import { Fees } from 'lib/fees';
import { SecondaryFee__factory } from 'contracts/types';
import { NativeTokenService } from 'lib/nativeTokenService';
import { DEFAULT_DEADLINE, DEFAULT_MAX_HOPS, DEFAULT_SLIPPAGE, MAX_MAX_HOPS, MIN_MAX_HOPS } from './constants';
import { Router } from './lib/router';
import { getERC20Decimals, isValidNonZeroAddress, newAmount, toPublicAmount } from './lib/utils';
import { ExchangeModuleConfiguration, Quote, SecondaryFee, TransactionDetails, TransactionResponse } from './types';
import { Amount, ERC20, Native } from './types/private';
import { getSwap, adjustQuoteWithFees } from './lib/transactionUtils/swap';
import { ExchangeConfiguration } from './config';

const toTransactionResponse = (
  quote: Quote,
  approval: TransactionDetails | null,
  swap: TransactionDetails,
): TransactionResponse => ({
  quote,
  approval,
  swap,
});

const toPublicQuote = (
  amount: Amount<ERC20>,
  amountWithMaxSlippage: Amount<ERC20>,
  slippage: number,
  fees: Fees,
  nativeTokenService: NativeTokenService,
): Quote => ({
  amount: toPublicAmount(amount),
  amountWithMaxSlippage,
  slippage,
  fees: fees.withAmounts().map((fee) => ({
    ...fee,
    amount: nativeTokenService.maybeWrapAmount(fee.amount),
  })),
});

export class Exchange {
  private provider: ethers.providers.JsonRpcProvider;

  private router: Router;

  private chainId: number;

  private nativeToken: Native;

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
    tokenInAddress: string,
    tokenOutAddress: string,
    amount: ethers.BigNumber,
    slippagePercent: number,
    maxHops: number,
    deadline: number,
    tradeType: TradeType,
  ): Promise<TransactionResponse> {
    Exchange.validate(tokenInAddress, tokenOutAddress, maxHops, slippagePercent, fromAddress);

    // get the decimals of the tokens that will be swapped
    const [tokenInDecimals, tokenOutDecimals, secondaryFees] = await Promise.all([
      getERC20Decimals(tokenInAddress, this.provider),
      getERC20Decimals(tokenOutAddress, this.provider),
      this.getSecondaryFees(),
    ]);

    const tokenIn: ERC20 = {
      type: 'erc20',
      address: tokenInAddress,
      chainId: this.chainId,
      decimals: tokenInDecimals,
    };
    const tokenOut: ERC20 = {
      type: 'erc20',
      address: tokenOutAddress,
      chainId: this.chainId,
      decimals: tokenOutDecimals,
    };

    // determine which amount was specified for the swap from the TradeType
    const [tokenSpecified, otherToken] =
      tradeType === TradeType.EXACT_INPUT ? [tokenIn, tokenOut] : [tokenOut, tokenIn];

    const amountSpecified = newAmount(amount, tokenSpecified);

    const fees = new Fees(secondaryFees, tokenIn);

    const ourQuoteReqAmount = getOurQuoteReqAmount(amountSpecified, fees, tradeType, this.nativeTokenService);

    // get quote and gas details
    const [ourQuote, gasPrice] = await Promise.all([
      this.router.findOptimalRoute(ourQuoteReqAmount, otherToken, tradeType, maxHops),
      fetchGasPrice(this.provider, this.nativeToken),
    ]);

    const adjustedQuote = adjustQuoteWithFees(ourQuote, amountSpecified, fees, this.nativeTokenService);

    const swap = getSwap(
      adjustedQuote,
      fromAddress,
      slippagePercent,
      deadline,
      this.routerContractAddress,
      this.secondaryFeeContractAddress,
      gasPrice,
      secondaryFees,
      this.nativeTokenService,
    );

    const quotedAmount = getQuoteAmountFromTradeType(adjustedQuote);
    const amountWithMaxSlippage = newAmount(
      applySlippage(adjustedQuote.tradeType, quotedAmount.value, slippagePercent),
      otherToken,
    );

    const preparedApproval = prepareApproval(
      tradeType,
      amountSpecified,
      amountWithMaxSlippage,
      {
        routerAddress: this.routerContractAddress,
        secondaryFeeAddress: this.secondaryFeeContractAddress,
      },
      secondaryFees,
    );

    // preparedApproval always uses the tokenIn address because we are always selling the tokenIn
    const approval = await getApproval(this.provider, fromAddress, preparedApproval, gasPrice, this.nativeTokenService);

    const userQuote = toPublicQuote(
      quotedAmount,
      amountWithMaxSlippage,
      slippagePercent,
      fees,
      this.nativeTokenService,
    );

    return toTransactionResponse(userQuote, approval, swap);
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
    return await this.getUnsignedSwapTx(
      fromAddress,
      tokenInAddress,
      tokenOutAddress,
      ethers.BigNumber.from(amountIn),
      slippagePercent,
      maxHops,
      deadline,
      TradeType.EXACT_INPUT,
    );
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
    return await this.getUnsignedSwapTx(
      fromAddress,
      tokenInAddress,
      tokenOutAddress,
      ethers.BigNumber.from(amountOut),
      slippagePercent,
      maxHops,
      deadline,
      TradeType.EXACT_OUTPUT,
    );
  }
}
