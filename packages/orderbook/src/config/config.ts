import { ModuleConfiguration } from '@imtbl/config';
import { providers } from 'ethers';
import { OrderBookClient } from 'openapi/sdk';

export interface OrderbookOverrides {
  apiEndpoint?: string;
  chainId?: string;
  orderbookClient?: OrderBookClient;
}

export interface OrderbookModuleConfiguration extends ModuleConfiguration<OrderbookOverrides> {
  seaportContractAddress: string
  zoneContractAddress: string
  provider: providers.JsonRpcProvider | providers.Web3Provider
}
