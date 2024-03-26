import { Environment } from '@imtbl/config';
import { providers } from 'ethers';

export const TESTNET_CHAIN_NAME = 'imtbl-zkevm-testnet';
export const MAINNET_CHAIN_NAME = 'imtbl-zkevm-mainnet';

export interface OrderbookOverrides {
  jsonRpcProviderUrl?: string;
  seaportContractAddress?: string;
  zoneContractAddress?: string;
  chainName?: string;
  apiEndpoint?: string;
}

export interface OrderbookModuleConfiguration {
  seaportContractAddress: string;
  zoneContractAddress: string;
  apiEndpoint: string;
  chainName: string;
  provider: providers.JsonRpcProvider;
}

export function getOrderbookConfig(
  environment: Environment,
): OrderbookModuleConfiguration | null {
  switch (environment) {
    case Environment.SANDBOX:
      return {
        seaportContractAddress: '0x7d117aA8BD6D31c4fa91722f246388f38ab1942c',
        zoneContractAddress: '0x8831867E347AB87FA30199C5B695F0A31604Bb52',
        apiEndpoint: 'https://api.sandbox.immutable.com',
        chainName: TESTNET_CHAIN_NAME,
        provider: new providers.JsonRpcProvider(
          'https://rpc.testnet.immutable.com',
        ),
      };
    // not yet deployed
    case Environment.PRODUCTION:
      return {
        seaportContractAddress: '0x6c12aD6F0bD274191075Eb2E78D7dA5ba6453424',
        zoneContractAddress: '0x00338b92Bec262078B3e49BF12bbEA058916BF91',
        apiEndpoint: 'https://api.immutable.com',
        chainName: MAINNET_CHAIN_NAME,
        provider: new providers.JsonRpcProvider(
          'https://rpc.immutable.com',
        ),
      };
    default:
      return null;
  }
}
