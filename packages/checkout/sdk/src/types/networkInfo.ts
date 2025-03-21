import { ChainId } from './chains';
import { TokenInfo } from './tokenInfo';

/**
 * Represents information about a network.
 * @interface NetworkInfo
 * @property {string} name - The name of the network.
 * @property {ChainId} chainId - The chain ID of the network.
 * @property {TokenInfo} nativeCurrency - Information about the native currency of the network.
 * @property {boolean} isSupported - Indicates whether the network is supported.
 */
export interface NetworkInfo {
  name: string;
  chainId: ChainId;
  nativeCurrency: TokenInfo;
  isSupported: boolean;
}
