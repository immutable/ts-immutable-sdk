import { ModuleConfiguration } from '@imtbl/config';
import { providers } from 'ethers';

export interface OrderbookOverrides {
  apiEndpoint?: string;
  chainId?: string;
}

export interface OrderbookModuleConfiguration extends ModuleConfiguration<OrderbookOverrides> {
  seaportContractAddress: string
  zoneContractAddress: string
  provider: providers.JsonRpcProvider | providers.Web3Provider
}
