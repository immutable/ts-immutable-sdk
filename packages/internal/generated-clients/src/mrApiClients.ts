import {
  ActivitiesApi,
  ChainsApi,
  CollectionsApi,
  NftOwnersApi,
  NftsApi,
  OrdersApi,
} from './multi-rollup';
import { ImmutableAPIConfiguration } from './config';

export class MultiRollupApiClients {
  public config: ImmutableAPIConfiguration;

  public activitiesApi: ActivitiesApi;

  public chainsApi: ChainsApi;

  public collectionApi: CollectionsApi;

  public nftOwnersApi: NftOwnersApi;

  public nftsApi: NftsApi;

  public ordersApi: OrdersApi;

  constructor(config: ImmutableAPIConfiguration) {
    this.config = config;
    this.activitiesApi = new ActivitiesApi(config);
    this.chainsApi = new ChainsApi(config);
    this.collectionApi = new CollectionsApi(config);
    this.nftOwnersApi = new NftOwnersApi(config);
    this.nftsApi = new NftsApi(config);
    this.ordersApi = new OrdersApi(config);
  }
}
