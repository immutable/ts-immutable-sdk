import { ExchangeContracts } from 'config';
import { ethers } from 'ethers';

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
 * Interface representing a Chain
 * @property {number} chainId - The chain ID
 * @property {string} rpcUrl - The RPC URL for the chain
 * @property {ExchangeContracts} contracts - The DEX contract addresses
 * @property {Token[]} commonRoutingTokens - The tokens used to find available pools for a swap
 * @property {Token} nativeToken - The native token of the chain
 */
export type Chain = {
  chainId: number;
  rpcUrl: string;
  contracts: ExchangeContracts;
  commonRoutingTokens: ERC20[];
  nativeToken: Native;
  wrappedNativeToken: ERC20;
};
