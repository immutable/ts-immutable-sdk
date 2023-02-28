import {
  AssetsApi,
  BalancesApi,
  CollectionsApi,
  DepositsApi,
  ExchangesApi,
  ImmutableX,
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
  WithdrawalsApi
} from "@imtbl/core-sdk";

export class Immutable {
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
    };

  constructor(config: ImmutableXConfiguration) {
    this.config = config;

    const imx = new ImmutableX(config); // coresdk

    this.StarkEx = {...imx};
  }

  public getConfig(): ImmutableXConfiguration {
    return this.config;
  }
}

