import { BLOCKSCOUT_CHAIN_URL_MAP } from '../env';
import { ChainId } from '../types';

export class BlockExplorerService {
  /**
   * Returns the link to the transaction on Blockscout.
   * @param {ChainId} chainId - The chain ID of the network
   * @param {string} hash - The transaction hash
   * @returns {string | undefined} The URL to view the transaction on Blockscout, or undefined if the chain ID or hash is invalid
   */
  public static getTransactionLink(chainId: ChainId, hash: string): string | undefined {
    const url = BLOCKSCOUT_CHAIN_URL_MAP?.[chainId]?.url;
    if (!url || !hash) return undefined;

    return `${url}/tx/${hash}`;
  }
}
