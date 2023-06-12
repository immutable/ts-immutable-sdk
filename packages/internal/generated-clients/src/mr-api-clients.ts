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
    this.activitiesApi = new ActivitiesApi(config.indexer());
    this.chainsApi = new ChainsApi(config.indexer());
    this.collectionApi = new CollectionsApi(config.indexer());
    this.nftOwnersApi = new NftOwnersApi(config.indexer());
    this.nftsApi = new NftsApi(config.indexer());
    this.ordersApi = new OrdersApi(config.orderBook());
  }
}
