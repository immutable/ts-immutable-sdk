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
        seaportContractAddress: '0x45E23dA18804F99Cf67408AeBE85F67c958381Ff',
        zoneContractAddress: '0x25b00b7eb97eab6194798E9B8eF63Aa526D5bd7E',
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
