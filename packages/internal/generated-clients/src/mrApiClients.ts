import {
  ActivitiesApi,
  ChainsApi,
  CollectionsApi,
  NftOwnersApi,
  NftsApi,
  OrdersApi,
} from './multi-rollup';
import { MultiRollupAPIConfiguration } from './config';

export class MultiRollupApiClients {
  public config: MultiRollupAPIConfiguration;

  public activitiesApi: ActivitiesApi;

  public chainsApi: ChainsApi;

  public collectionApi: CollectionsApi;

  public nftOwnersApi: NftOwnersApi;

  public nftsApi: NftsApi;

  public ordersApi: OrdersApi;

  constructor(config: MultiRollupAPIConfiguration) {
    this.config = config;
    this.activitiesApi = new ActivitiesApi(config.indexerMr());
    this.chainsApi = new ChainsApi(config.indexerMr());
    this.collectionApi = new CollectionsApi(config.indexerMr());
    this.nftOwnersApi = new NftOwnersApi(config.indexerMr());
    this.nftsApi = new NftsApi(config.indexerMr());
    this.ordersApi = new OrdersApi(config.orderBookMr());
  }
}
