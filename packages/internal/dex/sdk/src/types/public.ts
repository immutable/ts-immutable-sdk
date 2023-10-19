import { ethers } from 'ethers';
import { ModuleConfiguration } from '@imtbl/config';
import { ExchangeContracts } from 'config';
import { ERC20, Native } from './private';

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
  amount: Amount;
};

/**
 * Interface representing a quote for a swap
 * @property {Amount} amount - The quoted amount
 * @property {Amount} amountWithMaxSlippage - The quoted amount with the max slippage applied
 * @property {number} slippage - The slippage percentage used to calculate the quote
 */
export type Quote = { // Definitely public
  amount: Amount;
  amountWithMaxSlippage: Amount;
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

export type Token = {
  address: string; // either empty or "native" for native
  chainId: number;
  decimals: number;
  symbol?: string;
  name?: string;
};

export type Amount = {
  token: Token;
  value: ethers.BigNumber;
};

export interface ExchangeOverrides {
  rpcURL: string;
  exchangeContracts: ExchangeContracts;
  commonRoutingTokens: ERC20[];
  nativeToken: Native;
  wrappedNativeToken: ERC20;
}

export interface ExchangeModuleConfiguration
  extends ModuleConfiguration<ExchangeOverrides> {
  chainId: number;
  secondaryFees?: SecondaryFee[];
}
