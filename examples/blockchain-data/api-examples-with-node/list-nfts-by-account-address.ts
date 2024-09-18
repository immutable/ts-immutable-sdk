import { blockchainData } from '@imtbl/sdk';
import { client } from '../lib';

export async function listNFTsByAccountAddress(
  chainName: string,
  contractAddress: string,
  accountAddress: string,
): Promise<blockchainData.Types.ListNFTsResult> {
  // #doc blockchain-data-api-list-nfts-by-account-address
  return await client.listNFTsByAccountAddress({
    chainName,
    contractAddress,
    accountAddress,
  });
  // #enddoc blockchain-data-api-list-nfts-by-account-address
};
