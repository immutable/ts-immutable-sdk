import { Seaport as SeaportLib } from '@opensea/seaport-js';
import { providers } from 'ethers';
import { Seaport } from './seaport';

export class SeaportFactory {
  private seaport: SeaportLib;

  constructor(
    private readonly seaportContractAddress: string,
    private readonly zoneContractAddress: string,
    private readonly provider: providers.JsonRpcProvider,
  ) {
    this.seaport = new SeaportLib(provider, {
      seaportVersion: '1.4',
      balanceAndApprovalChecksOnOrderCreation: true,
      overrides: {
        contractAddress: seaportContractAddress,
      },
    });
  }

  create(): Seaport {
    return new Seaport(
      this.seaport,
      this.provider,
      this.seaportContractAddress,
      this.zoneContractAddress,
    );
  }
}
