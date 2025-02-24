import { Seaport as SeaportLib } from '@opensea/seaport-js';
import { JsonRpcProvider, JsonRpcSigner } from 'ethers';
import { SEAPORT_CONTRACT_VERSION_V1_5 } from './constants';

export type SeaportVersion = typeof SEAPORT_CONTRACT_VERSION_V1_5;

export class SeaportLibFactory {
  constructor(
    private readonly defaultSeaportContractAddress: string,
    private readonly provider: JsonRpcProvider,
  ) { }

  create(orderSeaportAddress?: string): SeaportLib {
    const seaportContractAddress = orderSeaportAddress ?? this.defaultSeaportContractAddress;

    const overwrittenProvider = this.provider;

    // The order book module only supports V5 JsonRpcProviders. These are instantiated
    // by the environment or by providing an RPC URL override. For this reason we can
    // safely instantiate a V6 provider for the V5 provider URL.
    // This needs to be removed and orderbook needs to be updated to handle the v6
    // provider.getSigner method properly.
    overwrittenProvider.getSigner = async function getSigner(
      address?: number | string,
    ): Promise<JsonRpcSigner> {
      if (address == null) {
        // eslint-disable-next-line no-param-reassign
        address = 0;
      }

      const accountsPromise = this.send('eth_accounts', []);

      // Account index
      if (typeof (address) === 'number') {
        const accounts = <Array<string>>(await accountsPromise);
        if (address >= accounts.length) { throw new Error('no such account'); }
        return new JsonRpcSigner(this, accounts[address]);
      }

      // Account address
      // This is where the override comes in to effect. We explicitly do not confirm if the
      // provider has access to the address as a signer.
      return new JsonRpcSigner(this, address);
    };

    return new SeaportLib(overwrittenProvider, {
      balanceAndApprovalChecksOnOrderCreation: true,
      overrides: {
        contractAddress: seaportContractAddress,
      },
    });
  }
}
