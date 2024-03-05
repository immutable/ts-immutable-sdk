import { Seaport as SeaportLib } from '@opensea/seaport-js';
// import { JsonRpcProvider } from 'ethers-v6';
import { providers } from 'ethers';
import { SEAPORT_CONTRACT_VERSION_V1_5 } from './constants';

export type SeaportVersion =
  typeof SEAPORT_CONTRACT_VERSION_V1_5;

// function convertToV6Provider(
//   provider: providers.JsonRpcProvider,
// ): JsonRpcProvider {
//   // TODO: Not sure if this will work for browsers, need to test
//   return new JsonRpcProvider(provider.connection.url);
// }

export class SeaportLibFactory {
  constructor(
    private readonly defaultSeaportContractAddress: string,
    private readonly provider: providers.JsonRpcProvider,
  ) { }

  create(orderSeaportVersion?: SeaportVersion, orderSeaportAddress?: string): SeaportLib {
    const seaportVersion = orderSeaportVersion ?? SEAPORT_CONTRACT_VERSION_V1_5;
    const seaportContractAddress = orderSeaportAddress ?? this.defaultSeaportContractAddress;

    // TODO: Another option to explor - the SDK probably only uses the provider to do direct
    // RPC calls, so might just be able to cast it and see.... we are not sending Transactions
    return new SeaportLib(this.provider as any, {
      seaportVersion,
      balanceAndApprovalChecksOnOrderCreation: true,
      overrides: {
        contractAddress: seaportContractAddress,
      },
    });
  }
}
