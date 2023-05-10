/* eslint-disable max-len */
import { ethers } from 'ethers';
import { MethodParameters } from '@uniswap/v3-sdk';
import {
  CurrencyAmount, Percent, Token, TradeType,
} from '@uniswap/sdk-core';
import assert from 'assert';
import JSBI from 'jsbi';

import {
  DEFAULT_DEADLINE,
  DEFAULT_MAX_HOPS,
  DEFAULT_SLIPPAGE,
  MAX_MAX_HOPS,
} from './constants';

import { Router } from './lib/router';
import {
  getERC20Decimals,
  validateAddress,
  validateDifferentAddresses,
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
    fromAddress?: string,
  ) {
    if (fromAddress) validateAddress(fromAddress);
    validateAddress(tokenInAddress);
    validateAddress(tokenOutAddress);
    validateDifferentAddresses(tokenInAddress, tokenOutAddress);
    assert(maxHops <= MAX_MAX_HOPS);
  }

  private async getUnsignedSwapTx(
    fromAddress: string,
    tokenInAddress: string,
    tokenOutAddress: string,
    amount: ethers.BigNumberish,
    slippagePercent: Percent,
    maxHops: number,
    deadline: number,
    tradeType: TradeType,
  ): Promise<TransactionResponse> {
    Exchange.validate(tokenInAddress, tokenOutAddress, maxHops, fromAddress);

    // get decimals of token
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

    let amountSpecified: CurrencyAmount<Token>;
    let otherToken: Token;
    const amountJsbi = JSBI.BigInt(amount.toString());
    if (tradeType === TradeType.EXACT_INPUT) {
      amountSpecified = CurrencyAmount.fromRawAmount(tokenIn, amountJsbi);
      otherToken = tokenOut;
    } else {
      amountSpecified = CurrencyAmount.fromRawAmount(tokenOut, amountJsbi);
      otherToken = tokenIn;
    }

    const routeAndQuote = await this.router.findOptimalRoute(
      amountSpecified,
      otherToken,
      tradeType,
      maxHops,
    );
    if (!routeAndQuote.success) {
      return {
        success: false,
        transaction: undefined,
        info: undefined,
      };
    }

    const params: MethodParameters = await createSwapParameters(
      routeAndQuote.trade,
      fromAddress,
      slippagePercent,
      deadline,
    );

    const quoteInfo = constructQuoteWithSlippage(
      otherToken,
      tradeType,
      routeAndQuote.trade,
      slippagePercent,
    );

    return {
      success: true,
      transaction: {
        data: params.calldata,
        to: this.router.routingContracts.peripheryRouterAddress,
        value: params.value,
        from: fromAddress,
      },
      info: {
        route: routeAndQuote.trade.route,
        quote: quoteInfo.quote,
        quoteWithMaxSlippage: quoteInfo.quoteWithMaxSlippage,
        slippage: `${slippagePercent.toSignificant()}%`,
      },
    };
  }

  /**
   * Get the unsigned swap transaction given the amount to sell.
   * Includes quote details for the swap.
   *
   * @param {string} fromAddress The EOA that will sign and submit the transaction.
   * @param {string} tokenInAddress Token address to sell.
   * @param {string} tokenOutAddress Token address to buy.
   * @param {ethers.BigNumberish} amountIn Amount to sell.
   * @param {Percent} slippagePercent (optional) The Percentage of slippage tolerance. Default is 0.1%
   * @param {number} maxHops (optional) Maximum hops allowed in optimal route. Default is 2
   * @param {number} deadline (optional) Latest time swap can execute. Default is 15 minutes
   */
  public async getUnsignedSwapTxFromAmountIn(
    fromAddress: string,
    tokenInAddress: string,
    tokenOutAddress: string,
    amountIn: ethers.BigNumberish,
    slippagePercent: Percent = DEFAULT_SLIPPAGE,
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
   * @param {string} fromAddress The EOA that will sign and submit the transaction.
   * @param {string} tokenInAddress Token address to sell.
   * @param {string} tokenOutAddress Token address to buy.
   * @param {ethers.BigNumberish} amountOut Amount to buy.
   * @param {Percent} slippagePercent (optional) The Percentage of slippage tolerance. Default is 0.1%
   * @param {number} maxHops (optional) Maximum hops allowed in optimal route. Default is 2
   * @param {number} deadline (optional) Latest time swap can execute. Default is 15 minutes
   * @return {TransactionResponse} The result containing the unsigned transaction to sign and execute.
   */
  public async getUnsignedSwapTxFromAmountOut(
    fromAddress: string,
    tokenInAddress: string,
    tokenOutAddress: string,
    amountOut: ethers.BigNumberish,
    slippagePercent: Percent = DEFAULT_SLIPPAGE,
    maxHops: number = DEFAULT_MAX_HOPS,
    deadline: number = DEFAULT_DEADLINE,
  ): Promise<TransactionResponse> {
    return this.getUnsignedSwapTx(
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
