import { providers } from 'ethers';
import { getConfigFromEnv, getLocalhostProvider } from 'test/helpers';

export const LOCAL_CHAIN_NAME = 'imtbl-zkevm-local';
export const DEVNET_CHAIN_NAME = 'imtbl-zkevm-devnet';
export const TESTNET_CHAIN_NAME = 'imtbl-zkevm-testnet';
export const MAINNET_CHAIN_NAME = 'imtbl-zkevm-mainnet';

export interface OrderbookOverrides {
  chainName: string;
}

export interface OrderbookModuleConfiguration {
  seaportContractAddress: string
  zoneContractAddress: string
  apiEndpoint: string;
  provider: providers.JsonRpcProvider | providers.Web3Provider
}

export function getOrderbookConfig(chainName?: string): OrderbookModuleConfiguration | null {
  switch (chainName) {
    case LOCAL_CHAIN_NAME:
      // eslint-disable-next-line no-case-declarations
      const localConfig = getConfigFromEnv();
      return {
        seaportContractAddress: localConfig.seaportContractAddress,
        zoneContractAddress: localConfig.zoneContractAddress,
        apiEndpoint: localConfig.apiUrl,
        provider: getLocalhostProvider(),
      };
    case DEVNET_CHAIN_NAME:
      return {
        seaportContractAddress: '0x41388404Efb7a68Fd31d75CEf71dF91e2BDBa2fb',
        zoneContractAddress: '0xCb5063b0c1dcF4f7fed8E7eaa79faf9859792767',
        apiEndpoint: 'https://order-book-mr.dev.imtbl.com',
        provider: new providers.JsonRpcProvider('https://zkevm-rpc.dev.x.immutable.com'),
      };
    case TESTNET_CHAIN_NAME:
      return {
        seaportContractAddress: '0x45E23dA18804F99Cf67408AeBE85F67c958381Ff',
        zoneContractAddress: '0x25b00b7eb97eab6194798E9B8eF63Aa526D5bd7E',
        apiEndpoint: 'https://order-book-mr.sandbox.imtbl.com',
        provider: new providers.JsonRpcProvider('https://zkevm-rpc.sandbox.x.immutable.com'),
      };
    case MAINNET_CHAIN_NAME:
      // not yet deployed
      return {
        seaportContractAddress: '',
        zoneContractAddress: '',
        apiEndpoint: 'https://order-book-mr.imtbl.com',
        provider: new providers.JsonRpcProvider('https://zkevm-rpc.x.immutable.com'),
      };
    default:
      return null;
  }
}
