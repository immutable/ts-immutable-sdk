import { ethers } from 'ethers';
import { ModuleConfiguration } from '@imtbl/config';
import { ExchangeContracts } from 'config';
import { CurrencyAmount, Token } from './amount';

/**
 * Interface representing a Chain
 * @property {number} chainId - The chain ID
 * @property {string} rpcUrl - The RPC URL for the chain
 * @property {ExchangeContracts} contracts - The DEX contract addresses
 * @property {Token[]} commonRoutingTokens - The tokens used to find available pools for a swap
 * @property {NativeCurrency} nativeToken - The native token of the chain
 */
export type Chain = {
  chainId: number;
  rpcUrl: string;
  contracts: ExchangeContracts;
  commonRoutingTokens: Token[];
  nativeToken: Token;
};

/**
 * Interface representing the secondary fees for a swap
 * @property {string} recipient - The fee recipient address
 * @property {number} basisPoints - The fee percentage in basis points
 * @example 100 basis points = 1%
 */
export type SecondaryFee = {
  recipient: string;
  basisPoints: number;
};

/**
 * Interface representing the fees returned in the quote
 * @property {string} recipient - The fee recipient address
 * @property {number} basisPoints - The fee percentage in basis points
 * @property {Amount} amount - The amount of the fee
 * @example 100 basis points = 1% = 1 IMX
 */
export type Fee = {
  recipient: string;
  basisPoints: number;
  amount: CurrencyAmount<Token>;
};

/**
 * Interface representing a quote for a swap
 * @property {Amount} amount - The quoted amount
 * @property {Amount} amountWithMaxSlippage - The quoted amount with the max slippage applied
 * @property {number} slippage - The slippage percentage used to calculate the quote
 */
export type Quote = {
  amount: CurrencyAmount<Token>;
  amountWithMaxSlippage: CurrencyAmount<Token>;
  slippage: number;
  fees: Fee[];
};

/**
 * Interface representing the details of a transaction
 * @property {ethers.providers.TransactionRequest} transaction - The unsigned transaction
 * @property {Amount | null} gasFeeEstimate - The gas fee estimate or null if it is not available
 */
export type TransactionDetails = {
  transaction: ethers.providers.TransactionRequest;
  gasFeeEstimate: CurrencyAmount<Token> | null;
};

/**
 * Interface representing the results of {@link Exchange.getUnsignedSwapTxFromAmountIn} {@link Exchange.getUnsignedSwapTxFromAmountOut}
 * @property {TransactionDetails | null} approval - The approval transaction or null if it is not required
 * @property {TransactionDetails} swap - The swap transaction
 * @property {Quote} quote - The quote details for the swap
 */
export type TransactionResponse = {
  approval: TransactionDetails | null;
  swap: TransactionDetails;
  quote: Quote;
};

export interface ExchangeOverrides {
  rpcURL: string;
  exchangeContracts: ExchangeContracts;
  commonRoutingTokens: Token[];
  nativeToken: Token;
}

export interface ExchangeModuleConfiguration
  extends ModuleConfiguration<ExchangeOverrides> {
  chainId: number;
  secondaryFees?: SecondaryFee[];
}
