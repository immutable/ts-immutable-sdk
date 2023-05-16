import { ethers } from 'ethers';
import { MethodParameters } from '@uniswap/v3-sdk';
import {
  CurrencyAmount, Token, TradeType,
} from '@uniswap/sdk-core';
import assert from 'assert';

import { slippageToFraction } from 'lib/transactionUtils/slippage';
import {
  DuplicateAddressesError, InvalidAddressError, InvalidMaxHopsError, InvalidSlippageError,
} from 'errors';
import { calculateGasFee, fetchGasPrice } from 'lib/transactionUtils/gas';
import {
  DEFAULT_DEADLINE,
  DEFAULT_MAX_HOPS,
  DEFAULT_SLIPPAGE,
  MAX_MAX_HOPS,
  MIN_MAX_HOPS,
} from './constants';

import { Router } from './lib/router';
import {
  getERC20Decimals,
  isValidAddress,
} from './lib/utils';
import { TransactionResponse } from './types';
import { createSwapParameters } from './lib/transactionUtils/swap';
import { ExchangeConfiguration } from './config';
import { constructQuoteWithSlippage } from './lib/transactionUtils/constructQuoteWithSlippage';

export class Exchange {
  private provider: ethers.providers.JsonRpcProvider;

  private router: Router;

  private chainId: number;

  constructor(configuration: ExchangeConfiguration) {
    this.chainId = configuration.chain.chainId;
    this.provider = new ethers.providers.JsonRpcProvider(
      configuration.chain.rpcUrl,
    );
    this.router = new Router(
      this.provider,
      configuration.chain.commonRoutingTokens,
      {
        multicallAddress: configuration.chain.contracts.multicall,
        factoryAddress: configuration.chain.contracts.coreFactory,
        quoterAddress: configuration.chain.contracts.quoterV2,
        peripheryRouterAddress: configuration.chain.contracts.peripheryRouter,
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
    assert(isValidAddress(fromAddress), new InvalidAddressError('invalid from address'));
    assert(isValidAddress(tokenInAddress), new InvalidAddressError('invalid token in address'));
    assert(isValidAddress(tokenOutAddress), new InvalidAddressError('invalid token out address'));
    assert(tokenInAddress.toLocaleLowerCase() !== tokenOutAddress.toLocaleLowerCase(), new DuplicateAddressesError());
    assert(maxHops <= MAX_MAX_HOPS, new InvalidMaxHopsError('max hops must be less than or equal to 10'));
    assert(maxHops >= MIN_MAX_HOPS, new InvalidMaxHopsError('max hops must be greater than or equal to 1'));
    assert(slippagePercent <= 50, new InvalidSlippageError('slippage percent must be less than or equal to 50'));
    assert(slippagePercent >= 0, new InvalidSlippageError('slippage percent must be greater than or equal to 0'));
  }

  private async getUnsignedSwapTx(
    fromAddress: string,
    tokenInAddress: string,
    tokenOutAddress: string,
    amount: ethers.BigNumberish,
    slippagePercent: number,
    maxHops: number,
    deadline: number,
    tradeType: TradeType,
  ): Promise<TransactionResponse> {
    Exchange.validate(tokenInAddress, tokenOutAddress, maxHops, slippagePercent, fromAddress);

    // get the decimals of the tokens that will be swapped
    const [tokenInDecimals, tokenOutDecimals] = await Promise.all([
      getERC20Decimals(tokenInAddress, this.provider),
      getERC20Decimals(tokenOutAddress, this.provider),
    ]);

    const tokenIn: Token = new Token(
      this.chainId,
      tokenInAddress,
      tokenInDecimals,
    );
    const tokenOut: Token = new Token(
      this.chainId,
      tokenOutAddress,
      tokenOutDecimals,
    );

    // determine which amount was specified for the swap from the TradeType
    let amountSpecified: CurrencyAmount<Token>;
    let otherToken: Token;
    if (tradeType === TradeType.EXACT_INPUT) {
      amountSpecified = CurrencyAmount.fromRawAmount(tokenIn, amount.toString());
      otherToken = tokenOut;
    } else {
      amountSpecified = CurrencyAmount.fromRawAmount(tokenOut, amount.toString());
      otherToken = tokenIn;
    }

    const routeAndQuote = await this.router.findOptimalRoute(
      amountSpecified,
      otherToken,
      tradeType,
      maxHops,
    );

    const slippage = slippageToFraction(slippagePercent);
    const params: MethodParameters = createSwapParameters(
      routeAndQuote.trade,
      fromAddress,
      slippage,
      deadline,
    );

    const quoteInfo = constructQuoteWithSlippage(
      otherToken,
      tradeType,
      routeAndQuote.trade,
      slippage,
    );

    const gasPrice = await fetchGasPrice(this.provider);
    const gasFeeEstimate = gasPrice ? calculateGasFee(gasPrice, routeAndQuote.trade.gasEstimate) : null;

    return {
      transaction: {
        data: params.calldata,
        to: this.router.routingContracts.peripheryRouterAddress,
        value: params.value,
        from: fromAddress,
      },
      info: {
        quote: quoteInfo.quote,
        quoteWithMaxSlippage: quoteInfo.quoteWithMaxSlippage,
        slippage: slippagePercent,
        gasFeeEstimate,
      },
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
      amountIn,
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
      amountOut,
      slippagePercent,
      maxHops,
      deadline,
      TradeType.EXACT_OUTPUT,
    );
  }
}
