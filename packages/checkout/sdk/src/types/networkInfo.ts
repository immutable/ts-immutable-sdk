import { TokenInfo } from './tokenInfo';

/**
 * Interface representing the information of a network.
 * @property {string} name - The name of the network.
 * @property {number} chainId - The ID of the network.
 * @property {TokenInfo} nativeCurrency - The info of the network's native currency.
 * @property {boolean} isSupported - Flag indicating if the network is supported by the application.
 */
export interface NetworkInfo {
  name: string;
  chainId: number;
  nativeCurrency: TokenInfo;
  isSupported: boolean;
}
