import {
  DepositsApi,
  MintsApi,
  OrdersApi,
  TokensApi,
  TradesApi,
  TransfersApi,
  UsersApi,
  WithdrawalsApi,
  BalancesApi,
  AssetsApi,
  CollectionsApi,
  MetadataApi,
  ProjectsApi,
  MetadataRefreshesApi,
  ExchangesApi,
  NftCheckoutPrimaryApi,
  EncodingApi,
} from './imx';
import { ImmutableAPIConfiguration } from './config';

export class ImxApiClients {
  public config: ImmutableAPIConfiguration;

  public assetApi: AssetsApi;

  public balanceApi: BalancesApi;

  public collectionApi: CollectionsApi;

  public depositsApi: DepositsApi;

  public encodingApi: EncodingApi;

  public exchangeApi: ExchangesApi;

  public metadataApi: MetadataApi;

  public metadataRefreshesApi: MetadataRefreshesApi;

  public mintsApi: MintsApi;

  public nftCheckoutPrimaryApi: NftCheckoutPrimaryApi;

  public ordersApi: OrdersApi;

  public projectsApi: ProjectsApi;

  public tokensApi: TokensApi;

  public tradesApi: TradesApi;

  public transfersApi: TransfersApi;

  public usersApi: UsersApi;

  public withdrawalsApi: WithdrawalsApi;

  constructor(config: ImmutableAPIConfiguration) {
    this.config = config;
    this.assetApi = new AssetsApi(config);
    this.balanceApi = new BalancesApi(config);
    this.collectionApi = new CollectionsApi(config);
    this.depositsApi = new DepositsApi(config);
    this.encodingApi = new EncodingApi(config);
    this.exchangeApi = new ExchangesApi(config);
    this.metadataApi = new MetadataApi(config);
    this.metadataRefreshesApi = new MetadataRefreshesApi(config);
    this.mintsApi = new MintsApi(config);
    this.nftCheckoutPrimaryApi = new NftCheckoutPrimaryApi(config);
    this.ordersApi = new OrdersApi(config);
    this.projectsApi = new ProjectsApi(config);
    this.tokensApi = new TokensApi(config);
    this.tradesApi = new TradesApi(config);
    this.transfersApi = new TransfersApi(config);
    this.usersApi = new UsersApi(config);
    this.withdrawalsApi = new WithdrawalsApi(config);
  }
}
