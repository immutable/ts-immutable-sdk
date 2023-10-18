import { ethers } from 'ethers';
import { TradeType } from '@uniswap/sdk-core';
import assert from 'assert';
import {
  DuplicateAddressesError,
  InvalidAddressError,
  InvalidMaxHopsError,
  InvalidSlippageError,
} from 'errors';
import { fetchGasPrice } from 'lib/transactionUtils/gas';
import { getApproval, prepareApproval } from 'lib/transactionUtils/approval';
import { getOurQuoteReqAmount, prepareUserQuote } from 'lib/transactionUtils/getQuote';
import { Fees } from 'lib/fees';
import { SecondaryFee__factory } from 'contracts/types';
import {
  DEFAULT_DEADLINE,
  DEFAULT_MAX_HOPS,
  DEFAULT_SLIPPAGE,
  MAX_MAX_HOPS,
  MIN_MAX_HOPS,
} from './constants';
import { Router } from './lib/router';
import {
  getERC20Decimals, isValidNonZeroAddress, newAmount,
} from './lib/utils';
import {
  ERC20,
  ExchangeModuleConfiguration, SecondaryFee, TransactionResponse,
} from './types';
import { getSwap, prepareSwap } from './lib/transactionUtils/swap';
import { ExchangeConfiguration } from './config';

export class Exchange {
  private provider: ethers.providers.JsonRpcProvider;

  private router: Router;

  private chainId: number;

  private nativeToken: ERC20;

  private secondaryFees: SecondaryFee[];

  constructor(configuration: ExchangeModuleConfiguration) {
    const config = new ExchangeConfiguration(configuration);

    this.chainId = config.chain.chainId;
    this.nativeToken = config.chain.nativeToken;
    this.secondaryFees = config.secondaryFees;

    this.provider = new ethers.providers.JsonRpcProvider(
      config.chain.rpcUrl,
    );

    this.router = new Router(
      this.provider,
      config.chain.commonRoutingTokens,
      {
        multicallAddress: config.chain.contracts.multicall,
        factoryAddress: config.chain.contracts.coreFactory,
        quoterAddress: config.chain.contracts.quoterV2,
        peripheryRouterAddress: config.chain.contracts.peripheryRouter,
        secondaryFeeAddress: config.chain.contracts.secondaryFee,
      },
    );
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

    const secondaryFeeContract = SecondaryFee__factory.connect(
      this.router.routingContracts.secondaryFeeAddress,
      this.provider,
    );

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
    const [tokenSpecified, otherToken] = tradeType === TradeType.EXACT_INPUT
      ? [tokenIn, tokenOut] : [tokenOut, tokenIn];

    const amountSpecified = newAmount(amount, tokenSpecified);

    const fees = new Fees(secondaryFees, tokenIn);

    const ourQuoteReqAmount = getOurQuoteReqAmount(amountSpecified, fees, tradeType);

    // get quote and gas details
    const [ourQuote, gasPrice] = await Promise.all([
      this.router.findOptimalRoute(
        ourQuoteReqAmount,
        otherToken,
        tradeType,
        maxHops,
      ),
      fetchGasPrice(this.provider, this.nativeToken),
    ]);

    const adjustedQuote = prepareSwap(ourQuote, amountSpecified, fees);

    const swap = getSwap(
      adjustedQuote,
      fromAddress,
      slippagePercent,
      deadline,
      this.router.routingContracts.peripheryRouterAddress,
      this.router.routingContracts.secondaryFeeAddress,
      gasPrice,
      secondaryFees,
    );

    const userQuote = prepareUserQuote(otherToken, adjustedQuote, slippagePercent, fees);

    const preparedApproval = prepareApproval(
      tradeType,
      amountSpecified,
      userQuote.amountWithMaxSlippage,
      this.router.routingContracts,
      secondaryFees,
    );

    // preparedApproval always uses the tokenIn address because we are always selling the tokenIn
    const approval = await getApproval(
      this.provider,
      fromAddress,
      preparedApproval,
      gasPrice,
    );

    return {
      approval,
      swap,
      quote: userQuote,
    };
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
