import { ModuleConfiguration } from '@imtbl/config';
import { OrderBookClient } from 'openapi/sdk';

export interface OrderbookOverrides {
  apiEndpoint?: string;
  chainId?: string;
  orderbookClient?: OrderBookClient;
}

export interface OrderbookModuleConfiguration extends ModuleConfiguration<OrderbookOverrides> {}
