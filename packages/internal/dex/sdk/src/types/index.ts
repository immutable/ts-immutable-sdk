import { ethers } from 'ethers';
import { ModuleConfiguration } from '@imtbl/config';

export * as deprecated from './deprecated';

export type ExchangeContracts = {
  multicall: string;
  coreFactory: string;
  quoterV2: string;
  peripheryRouter: string;
  secondaryFee: string;
};

/**
 * Type representing a Chain
 * @property {number} chainId - The chain ID
 * @property {string} rpcUrl - The RPC URL for the chain
 * @property {@link ExchangeContracts} contracts - The DEX contract addresses
 * @property {@link ERC20[]} commonRoutingTokens - The tokens used to find available pools for a swap
 * @property {@link Coin} nativeToken - The native token of the chain
 * @property {@link ERC20} wrappedNativeToken - The wrapped native token of the chain
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
 * Type representing the secondary fees for a swap
 * @property {string} recipient - The fee recipient address
 * @property {number} basisPoints - The fee percentage in basis points
 * @example 100 basis points = 1%
 */
export type SecondaryFee = {
  recipient: string;
  basisPoints: number;
};

/**
 * Type representing the fees returned in the quote
 * @property {string} recipient - The fee recipient address
 * @property {number} basisPoints - The fee percentage in basis points
 * @property {@link Amount} amount - The amount of the fee
 * @example 100 basis points = 1% = 1 IMX
 */
export type Fee = {
  recipient: string;
  basisPoints: number;
  amount: CoinAmount<Coin>;
};

/**
 * Type representing an amount with the token information
 * @property {@link Coin} token - The coin for the amount, either a {@link Native} or {@link ERC20}
 * @property {ethers.BigNumber} value - The value of the amount in the token's smallest unit
 */
export type CoinAmount<T extends Coin> = {
  token: T;
  value: ethers.BigNumber;
};

/**
 * Type representing a quote for a swap
 * @property {@link CoinAmount<Native>} amount - The quoted amount with fees applied
 * @property {@link CoinAmount<Native>} amountWithMaxSlippage - The quoted amount with the max slippage and fees applied
 * @property {number} slippage - The slippage percentage used to calculate the quote
 * @property {@link Fee[]} fees - The secondary fees applied to the swap
 */
export type Quote = {
  amount: CoinAmount<Coin>;
  amountWithMaxSlippage: CoinAmount<Coin>;
  slippage: number;
  fees: Fee[];
};

/**
 * Type representing the details of a transaction
 * @property {@link ethers.providers.TransactionRequest} transaction - The unsigned transaction
 * @property {@link CoinAmount<Native> | null} gasFeeEstimate - The gas fee estimate or null if it is not available
 */
export type TransactionDetails = {
  transaction: ethers.providers.TransactionRequest;
  gasFeeEstimate: CoinAmount<Native> | null;
};

/**
 * Type representing the results of {@link Exchange.getUnsignedSwapTxFromAmountIn} {@link Exchange.getUnsignedSwapTxFromAmountOut}
 * @property {@link TransactionDetails | null} approval - The approval transaction or null if it is not required
 * @property {@link TransactionDetails} swap - The swap transaction
 * @property {@link Quote} quote - The quote details for the swap
 */
export type TransactionResponse = {
  approval: TransactionDetails | null;
  swap: TransactionDetails;
  quote: Quote;
};

/**
 * Type representing an ERC20 token
 * @property {string} type - The token type, used to discriminate between {@link ERC20} and {@link Native}
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
 * Type representing a native token
 * @property {string} type - The token type, used to discriminate between {@link ERC20} and {@link Native}
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

/**
 * Type representing a token, either an {@link ERC20} or {@link Native}
 */
export type Coin = ERC20 | Native;

/**
 * Type representing the overrides for the {@link Exchange} module
 * @property {string} rpcURL - The RPC URL for the chain
 * @property {ExchangeContracts} exchangeContracts - The DEX contract addresses
 * @property {ERC20[]} commonRoutingTokens - The tokens used to find available pools for a swap
 * @property {Coin} nativeToken - The native token of the chain
 * @property {ERC20} wrappedNativeToken - The wrapped native token of the chain
 */
export type ExchangeOverrides = {
  rpcURL: string;
  exchangeContracts: ExchangeContracts;
  commonRoutingTokens: ERC20[];
  nativeToken: Native;
  wrappedNativeToken: ERC20;
};

/**
 * Interface representing the configuration for the {@link Exchange} module
 * @property {number} chainId - The chain ID
 * @property {@link SecondaryFee[]} secondaryFees - The secondary fees for a swap
 */
export interface ExchangeModuleConfiguration extends ModuleConfiguration<ExchangeOverrides> {
  chainId: number;
  secondaryFees?: SecondaryFee[];
}
