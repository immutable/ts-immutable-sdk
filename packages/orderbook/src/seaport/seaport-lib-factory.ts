import { Seaport as SeaportLib } from '@opensea/seaport-js';
import { providers } from 'ethers';
import { SEAPORT_CONTRACT_VERSION_V1_4, SEAPORT_CONTRACT_VERSION_V1_5 } from './constants';

export type SeaportVersion =
  typeof SEAPORT_CONTRACT_VERSION_V1_4 |
  typeof SEAPORT_CONTRACT_VERSION_V1_5;

export class SeaportLibFactory {
  constructor(
    private readonly defaultSeaportContractAddress: string,
    private readonly provider: providers.JsonRpcProvider,
  ) { }

  create(orderSeaportVersion?: SeaportVersion, orderSeaportAddress?: string): SeaportLib {
    const seaportVersion = orderSeaportVersion ?? SEAPORT_CONTRACT_VERSION_V1_4;
    const seaportContractAddress = orderSeaportAddress ?? this.defaultSeaportContractAddress;

    return new SeaportLib(this.provider, {
      seaportVersion,
      balanceAndApprovalChecksOnOrderCreation: true,
      overrides: {
        contractAddress: seaportContractAddress,
      },
    });
  }
}
