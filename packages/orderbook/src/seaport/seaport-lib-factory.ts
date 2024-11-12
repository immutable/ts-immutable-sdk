import { Seaport as SeaportLib } from '@opensea/seaport-js';
import { JsonRpcProvider } from 'ethers';
import { SEAPORT_CONTRACT_VERSION_V1_5 } from './constants';

export type SeaportVersion = typeof SEAPORT_CONTRACT_VERSION_V1_5;

export class SeaportLibFactory {
  constructor(
    private readonly defaultSeaportContractAddress: string,
    private readonly provider: JsonRpcProvider,
  ) { }

  create(orderSeaportAddress?: string): SeaportLib {
    const seaportContractAddress = orderSeaportAddress ?? this.defaultSeaportContractAddress;

    return new SeaportLib(this.provider, {
      balanceAndApprovalChecksOnOrderCreation: true,
      overrides: {
        contractAddress: seaportContractAddress,
      },
    });
  }
}
