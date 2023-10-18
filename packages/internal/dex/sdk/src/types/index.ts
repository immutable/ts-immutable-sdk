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
  commonRoutingTokens: ERC20[];
  nativeToken: Native;
  wrappedNativeToken: ERC20;
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
  amount: Amount<ERC20>;
};

/**
 * Interface representing an amount with the token information
 * @property {TokenInfo} token - The token information
 * @property {ethers.BigNumber} value - The amount
 */
export type Amount<T extends Coin> = {
  token: T;
  value: ethers.BigNumber;
};

/**
 * Interface representing a quote for a swap
 * @property {Amount} amount - The quoted amount
 * @property {Amount} amountWithMaxSlippage - The quoted amount with the max slippage applied
 * @property {number} slippage - The slippage percentage used to calculate the quote
 */
export type Quote = {
  amount: Amount<ERC20>;
  amountWithMaxSlippage: Amount<ERC20>;
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
  gasFeeEstimate: Amount<Native> | null;
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
 * Interface representing an ERC20 token
 * @property {number} chainId - The chain ID
 * @property {string} address - The token address
 * @property {number} decimals - The token decimals
 * @property {string | undefined} symbol - The token symbol or undefined if it is not available
 * @property {string | undefined} name - The token name or undefined if it is not available
 */
export type ERC20 = {
  type: 'erc20';
  chainId: number;
  address: string;
  decimals: number;
  symbol?: string;
  name?: string;
};

/**
 * Interface representing a native token
 * @property {number} chainId - The chain ID
 * @property {number} decimals - The token decimals
 * @property {string | undefined} symbol - The token symbol or undefined if it is not available
 * @property {string | undefined} name - The token name or undefined if it is not available
 */
export type Native = {
  type: 'native';
  chainId: number;
  decimals: number;
  symbol?: string;
  name?: string;
};

export type Coin = ERC20 | Native;

export interface ExchangeOverrides {
  rpcURL: string;
  exchangeContracts: ExchangeContracts;
  commonRoutingTokens: ERC20[];
  nativeToken: Native;
  wrappedNativeToken: ERC20;
}

export interface ExchangeModuleConfiguration extends ModuleConfiguration<ExchangeOverrides> {
  chainId: number;
  secondaryFees?: SecondaryFee[];
}
