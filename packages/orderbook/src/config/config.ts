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
        seaportContractAddress: '0x2CFA8f64e1B49A2DF28532D1D30Cda45117cF778',
        zoneContractAddress: '0x1Bb4Fb11Ba021Bd0104F0Ee8E5F5c728Bc83d7F1',
        apiEndpoint: 'https://api.sandbox.immutable.com',
        chainName: TESTNET_CHAIN_NAME,
        provider: new providers.JsonRpcProvider(
          'https://rpc.testnet.immutable.com',
        ),
      };
    // not yet deployed
    case Environment.PRODUCTION:
      return {
        seaportContractAddress: '',
        zoneContractAddress: '',
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
