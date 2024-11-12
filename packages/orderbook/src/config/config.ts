import { Environment, ModuleConfiguration } from '@imtbl/config';
import { FetchRequest, JsonRpcProvider } from 'ethers';

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
  provider: JsonRpcProvider;
}

export function getConfiguredProvider(
  url: string,
  rateLimitingKey?: string,
): JsonRpcProvider {
  const fetchRequest = new FetchRequest(url);
  if (rateLimitingKey) fetchRequest.setHeader('x-api-key', rateLimitingKey);

  return new JsonRpcProvider(fetchRequest);
}

export function getOrderbookConfig(
  config: ModuleConfiguration<OrderbookOverrides>,
): OrderbookModuleConfiguration | null {
  switch (config.baseConfig.environment) {
    case Environment.SANDBOX:
      return {
        seaportContractAddress: '0x7d117aA8BD6D31c4fa91722f246388f38ab1942c',
        zoneContractAddress: '0x1004f9615E79462c711Ff05a386BdbA91a7628C3', // ImmutableSignedZoneV2
        apiEndpoint: 'https://api.sandbox.immutable.com',
        chainName: TESTNET_CHAIN_NAME,
        provider: getConfiguredProvider('https://rpc.testnet.immutable.com', config.baseConfig.rateLimitingKey),
      };
    // not yet deployed
    case Environment.PRODUCTION:
      return {
        seaportContractAddress: '0x6c12aD6F0bD274191075Eb2E78D7dA5ba6453424',
        zoneContractAddress: '0x1004f9615E79462c711Ff05a386BdbA91a7628C3', // ImmutableSignedZoneV2
        apiEndpoint: 'https://api.immutable.com',
        chainName: MAINNET_CHAIN_NAME,
        provider: getConfiguredProvider('https://rpc.immutable.com', config.baseConfig.rateLimitingKey),
      };
    default:
      return null;
  }
}
