import {
  AssetsApi,
  BalancesApi,
  CollectionsApi,
  DepositsApi,
  ExchangesApi,
  ImmutableX as imtbl,
  ImmutableXConfiguration,
  MetadataApi,
  MetadataRefreshesApi,
  MintsApi,
  NftCheckoutPrimaryApi,
  OrdersApi,
  ProjectsApi,
  TokensApi,
  TradesApi,
  TransfersApi,
  UsersApi,
  WithdrawalsApi,
  EncodingApi
} from "@imtbl/core-sdk";

export class ImmutableX {
  private readonly config: ImmutableXConfiguration;
  public StarkEx:
    {
      depositsApi: DepositsApi,
      mintsApi: MintsApi,
      ordersApi: OrdersApi,
      tokensApi: TokensApi,
      tradesApi: TradesApi,
      transfersApi: TransfersApi,
      exchangeApi: ExchangesApi,
      nftCheckoutPrimaryApi: NftCheckoutPrimaryApi,
      usersApi: UsersApi,
      withdrawalsApi: WithdrawalsApi,
      balanceApi: BalancesApi,
      assetApi: AssetsApi,
      collectionApi: CollectionsApi,
      metadataApi: MetadataApi,
      metadataRefreshesApi: MetadataRefreshesApi,
      projectsApi: ProjectsApi
      encodingApi: EncodingApi
    };

  constructor(config: ImmutableXConfiguration) {
    this.config = config;

    const imx = new imtbl(config); // coresdk

    const encodingApi = new EncodingApi(config.apiConfiguration)
    this.StarkEx = {...imx, encodingApi};
  }

  public getConfig(): ImmutableXConfiguration {
    return this.config;
  }
}

