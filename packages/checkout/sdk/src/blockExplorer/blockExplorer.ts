import { BLOCKSCOUT_CHAIN_URL_MAP } from '../env';
import { ChainId } from '../types';

export class BlockExplorerService {
  /**
   * getTransationLink returns the link to the transaction on blockscout
   * @param hash transaction hash
   * @returns link to the transaction on blockscout
   */
  public static getTransactionLink(chainId: ChainId, hash: string): string | undefined {
    const url = BLOCKSCOUT_CHAIN_URL_MAP?.[chainId]?.url;
    if (!url || !hash) return undefined;

    return `${url}/tx/${hash}`;
  }
}
