import { Seaport as SeaportLib } from '@opensea/seaport-js';
import { JsonRpcProvider, JsonRpcSigner } from 'ethers-v6';
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
  const overwrittenProvider = new JsonRpcProvider(provider.connection.url);

  // Need to override the getSigner method to mimic V5 behaviour
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
    const signer = new JsonRpcSigner(this, address);
    signer.getAddress = async () => address as string;
    return signer;
  };

  return overwrittenProvider;
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
