import { ethers } from 'ethers';
import { ModuleConfiguration } from '@imtbl/config';
import { ExchangeContracts } from 'config';

/**
 * Interface representing a Chain
 * @property {number} chainId - The chain ID
 * @property {string} rpcUrl - The RPC URL for the chain
 * @property {ExchangeContracts} contracts - The DEX contract addresses
 * @property {Token[]} commonRoutingTokens - The tokens used to find available pools for a swap
 * @property {TokenInfo} nativeToken - The native token of the chain
 */
export type Chain = {
  chainId: number;
  rpcUrl: string;
  contracts: ExchangeContracts;
  commonRoutingTokens: TokenInfo[];
  nativeToken: TokenInfo;
};

/**
 * Interface representing the secondary fees for a swap
 * @property {string} feeRecipient - The fee recipient address
 * @property {number} feeBasisPoints - The fee percentage in basis points
 * @example 100 basis points = 1%
 */
export type SecondaryFee = {
  feeRecipient: string;
  feeBasisPoints: number;
};

/**
 * Interface representing an amount with the token information
 * @property {TokenInfo} token - The token information
 * @property {ethers.BigNumber} value - The amount
 */
export type Amount = {
  token: TokenInfo;
  value: ethers.BigNumber;
};

/**
 * Interface representing a quote for a swap
 * @property {Amount} amount - The quoted amount
 * @property {Amount} amountWithMaxSlippage - The quoted amount with the max slippage applied
 * @property {number} slippage - The slippage percentage used to calculate the quote
 */
export type Quote = {
  amount: Amount;
  amountWithMaxSlippage: Amount;
  slippage: number;
};

/**
 * Interface representing the details of a transaction
 * @property {ethers.providers.TransactionRequest} transaction - The unsigned transaction
 * @property {Amount | null} gasFeeEstimate - The gas fee estimate or null if it is not available
 */
export type TransactionDetails = {
  transaction: ethers.providers.TransactionRequest;
  gasFeeEstimate: Amount | null;
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

/**
 * Interface representing a token
 * @property {number} chainId - The chain ID
 * @property {string} address - The token address
 * @property {number} decimals - The token decimals
 * @property {string | undefined} symbol - The token symbol or undefined if it is not available
 * @property {string | undefined} name - The token name or undefined if it is not available
 */
export type TokenInfo = {
  chainId: number;
  address: string;
  decimals: number;
  symbol?: string;
  name?: string;
};

export interface ExchangeOverrides {
  rpcURL: string;
  exchangeContracts: ExchangeContracts;
  commonRoutingTokens: TokenInfo[];
  nativeToken: TokenInfo;
  secondaryFees?: SecondaryFee[];
}

export interface ExchangeModuleConfiguration
  extends ModuleConfiguration<ExchangeOverrides> {
  chainId: number;
}
