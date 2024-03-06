import { Seaport as SeaportLib } from '@opensea/seaport-js';
import { JsonRpcProvider } from 'ethers-v6';
import { providers } from 'ethers';
import { SEAPORT_CONTRACT_VERSION_V1_5 } from './constants';

export type SeaportVersion =
  typeof SEAPORT_CONTRACT_VERSION_V1_5;

// The order book module only supports V5 JsonRpcProviders. These are instantiated
// by the environment or by providing an RPC URL override. For this reason we can
// safely instantiate a V6 provider for the V5 provider URL.
function convertToV6Provider(
  provider: providers.JsonRpcProvider,
): JsonRpcProvider {
  return new JsonRpcProvider(provider.connection.url);
}

export class SeaportLibFactory {
  constructor(
    private readonly defaultSeaportContractAddress: string,
    private readonly provider: providers.JsonRpcProvider,
  ) { }

  create(orderSeaportVersion?: SeaportVersion, orderSeaportAddress?: string): SeaportLib {
    const seaportVersion = orderSeaportVersion ?? SEAPORT_CONTRACT_VERSION_V1_5;
    const seaportContractAddress = orderSeaportAddress ?? this.defaultSeaportContractAddress;

    return new SeaportLib(convertToV6Provider(this.provider), {
      seaportVersion,
      balanceAndApprovalChecksOnOrderCreation: true,
      overrides: {
        contractAddress: seaportContractAddress,
      },
    });
  }
}
