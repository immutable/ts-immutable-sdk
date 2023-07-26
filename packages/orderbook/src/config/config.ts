import { Environment } from '@imtbl/config';
import { providers } from 'ethers';

export const LOCAL_CHAIN_NAME = 'imtbl-zkevm-local';
export const DEVNET_CHAIN_NAME = 'imtbl-zkevm-devnet';
export const TESTNET_CHAIN_NAME = 'imtbl-zkevm-testnet';
export const MAINNET_CHAIN_NAME = 'imtbl-zkevm-mainnet';

export interface OrderbookOverrides {
  provider?: providers.JsonRpcProvider | providers.Web3Provider;
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
  provider: providers.JsonRpcProvider | providers.Web3Provider;
}

export function getOrderbookConfig(
  environment: Environment,
): OrderbookModuleConfiguration | null {
  switch (environment) {
    case Environment.SANDBOX:
      return {
        seaportContractAddress: '0x474989C4D25DD41B0B9b1ECb4643B9Fe25f83B19',
        zoneContractAddress: '0x6FeDb4949E5b452700A8a8956999a7E05B6770F3',
        apiEndpoint: 'https://order-book-mr.sandbox.imtbl.com',
        chainName: TESTNET_CHAIN_NAME,
        provider: new providers.JsonRpcProvider(
          'https://zkevm-rpc.sandbox.x.immutable.com',
        ),
      };
    // not yet deployed
    case Environment.PRODUCTION:
      return {
        seaportContractAddress: '',
        zoneContractAddress: '',
        apiEndpoint: 'https://order-book-mr.imtbl.com',
        chainName: MAINNET_CHAIN_NAME,
        provider: new providers.JsonRpcProvider(
          'https://zkevm-rpc.x.immutable.com',
        ),
      };
    default:
      return null;
  }
}
