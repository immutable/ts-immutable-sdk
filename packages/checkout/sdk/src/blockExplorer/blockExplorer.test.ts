/* eslint @typescript-eslint/naming-convention: off */

import { BLOCKSCOUT_CHAIN_URL_MAP } from '../env';
import { ChainId } from '../types';
import { BlockExplorerService } from './blockExplorer';

describe('BlockExplorerService', () => {
  it('Should not return link for unknown chainId', () => {
    const url = BlockExplorerService.getTransactionLink('unknown' as unknown as ChainId, '0x123');
    expect(url).toBe(undefined);
  });

  it('Should return link for known chainId', () => {
    const expectedUrl = BLOCKSCOUT_CHAIN_URL_MAP[ChainId.IMTBL_ZKEVM_TESTNET].url;
    const url = BlockExplorerService.getTransactionLink(ChainId.IMTBL_ZKEVM_TESTNET, '0x123');
    expect(url).toBe(`${expectedUrl}/tx/0x123`);
  });
});
