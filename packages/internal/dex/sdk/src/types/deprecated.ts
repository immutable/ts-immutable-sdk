import { ethers } from 'ethers';

/**
 * Type representing the results of {@link Exchange.getUnsignedSwapTxFromAmountIn} {@link Exchange.getUnsignedSwapTxFromAmountOut}
 * @deprecated
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
 * Type representing a token
 * @deprecated
 * @property {number} chainId - The chain ID
 * @property {string} address - The token address, or the empty string for the native token
 * @property {number} decimals - The token decimals
 * @property {string | undefined} symbol - The token symbol or undefined if it is not available
 * @property {string | undefined} name - The token name or undefined if it is not available
 */
export type Token = {
  chainId: number;
  address: string;
  decimals: number;
  symbol?: string;
  name?: string;
};

/**
 * Interface representing a token amount
 * @deprecated
 * @property {@link Token} token - The token
 * @property {@link ethers.BigNumber} value - The amount
 */
export type Amount = {
  token: Token;
  value: ethers.BigNumber;
};

/**
 * Type representing the fees returned in the quote
 * @deprecated
 * @property {string} recipient - The fee recipient address
 * @property {number} basisPoints - The fee percentage in basis points
 * @property {@link Amount} amount - The amount of the fee
 * @example 100 basis points = 1% = 1 IMX
 */
export type Fee = {
  recipient: string;
  basisPoints: number;
  amount: Amount;
};

/**
 * Type representing a quote for a swap
 * @deprecated
 * @property {@link Amount} amount - The quoted amount with fees applied
 * @property {@link Amount} amountWithMaxSlippage - The quoted amount with the max slippage and fees applied
 * @property {number} slippage - The slippage percentage used to calculate the quote
 * @property {@link Fee[]} fees - The secondary fees applied to the swap
 */
export type Quote = {
  amount: Amount;
  amountWithMaxSlippage: Amount;
  slippage: number;
  fees: Fee[];
};

/**
 * Type representing the details of a transaction
 * @deprecated
 * @property {@link ethers.providers.TransactionRequest} transaction - The unsigned transaction
 * @property {@link Amount | null} gasFeeEstimate - The gas fee estimate or null if it is not available
 */
export type TransactionDetails = {
  transaction: ethers.providers.TransactionRequest;
  gasFeeEstimate: Amount | null;
};
