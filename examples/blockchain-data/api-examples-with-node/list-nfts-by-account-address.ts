import { blockchainData } from '@imtbl/sdk';

import { client } from '../lib';

export const listNFTsByAccountAddress = async (
  contractAddress: string,
  accountAddress: string,
): Promise<blockchainData.Types.ListNFTsResult> => {
  return await client.listNFTsByAccountAddress({
    chainName: 'imtbl-zkevm-testnet',
    contractAddress,
    accountAddress,
  });
};
