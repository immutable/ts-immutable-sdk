import {
  ImmutableX,
  EthSigner,
  generateLegacyStarkPrivateKey,
  createStarkSigner,
  UnsignedExchangeTransferRequest,
  UnsignedMintRequest,
  WalletConnection,
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
  DepositsApiGetDepositRequest,
  DepositsApiListDepositsRequest,
  AssetsApiGetAssetRequest,
  AssetsApiListAssetsRequest,
  CreateCollectionRequest,
  CollectionsApiGetCollectionRequest,
  CollectionsApiListCollectionFiltersRequest,
  CollectionsApiListCollectionsRequest,
  UpdateCollectionRequest,
  AddMetadataSchemaToCollectionRequest,
  MetadataApiGetMetadataSchemaRequest,
  MetadataSchemaRequest,
  CreateProjectRequest,
  BalancesApiGetBalanceRequest,
  BalancesApiListBalancesRequest,
  MintsApiGetMintRequest,
  MintsApiListMintsRequest,
  WithdrawalsApiListWithdrawalsRequest,
  WithdrawalsApiGetWithdrawalRequest,
  OrdersApiGetOrderRequest,
  OrdersApiListOrdersRequest,
  TradesApiGetTradeRequest,
  TradesApiListTradesRequest,
  TokensApiGetTokenRequest,
  TokensApiListTokensRequest,
  TransfersApiGetTransferRequest,
  TransfersApiListTransfersRequest,
  MetadataRefreshesApi,
  CreateMetadataRefreshRequest,
  ExchangesApi,
  ExchangesApiCreateExchangeRequest,
  ExchangesApiGetExchangeRequest,
  ExchangesApiGetExchangesRequest,
  NftCheckoutPrimaryApi,
  NftCheckoutPrimaryApiCreateNftPrimaryRequest,
  NftCheckoutPrimaryApiGetCurrenciesNFTCheckoutPrimaryRequest,
  NftCheckoutPrimaryApiGetNftPrimaryTransactionRequest,
  NftCheckoutPrimaryApiGetNftPrimaryTransactionsRequest,
} from '@imtbl/core-sdk';
import { ImxConfiguration, ImxModuleConfiguration } from './config';

export {
  ImxModuleConfiguration as ImxClientModuleConfiguration,
  generateLegacyStarkPrivateKey as imxClientGenerateLegacyStarkPrivateKey,
  createStarkSigner as imxClientCreateStarkSigner,
  WalletConnection as ImxClientWalletConnection,
};

export class ImmutableXClient {
  private immutableX: ImmutableX;

  public depositsApi: DepositsApi;

  public mintsApi: MintsApi;

  public ordersApi: OrdersApi;

  public tokensApi: TokensApi;

  public tradesApi: TradesApi;

  public transfersApi: TransfersApi;

  public exchangeApi: ExchangesApi;

  public nftCheckoutPrimaryApi: NftCheckoutPrimaryApi;

  public usersApi: UsersApi;

  public withdrawalsApi: WithdrawalsApi;

  public balanceApi: BalancesApi;

  public assetApi: AssetsApi;

  public collectionApi: CollectionsApi;

  public metadataApi: MetadataApi;

  public metadataRefreshesApi: MetadataRefreshesApi;

  public projectsApi: ProjectsApi;

  constructor(config: ImxModuleConfiguration) {
    const imxConfig = new ImxConfiguration(config);
    this.immutableX = new ImmutableX(imxConfig.immutableXConfig);
    this.depositsApi = this.immutableX.depositsApi;
    this.mintsApi = this.immutableX.mintsApi;
    this.ordersApi = this.immutableX.ordersApi;
    this.tokensApi = this.immutableX.tokensApi;
    this.tradesApi = this.immutableX.tradesApi;
    this.transfersApi = this.immutableX.transfersApi;
    this.exchangeApi = this.immutableX.exchangeApi;
    this.usersApi = this.immutableX.usersApi;
    this.withdrawalsApi = this.immutableX.withdrawalsApi;
    this.balanceApi = this.immutableX.balanceApi;
    this.assetApi = this.immutableX.assetApi;
    this.collectionApi = this.immutableX.collectionApi;
    this.metadataApi = this.immutableX.metadataApi;
    this.metadataRefreshesApi = this.immutableX.metadataRefreshesApi;
    this.nftCheckoutPrimaryApi = this.immutableX.nftCheckoutPrimaryApi;
    this.projectsApi = this.immutableX.projectsApi;
  }

  /**
   * Get details of a Deposit with the given ID
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Deposit
   * @throws {@link index.IMXError}
   */
  public getDeposit(request: DepositsApiGetDepositRequest) {
    return this.immutableX.getDeposit(request);
  }

  /**
   * Get a list of Deposits
   * @param request - optional object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Deposits
   * @throws {@link index.IMXError}
   */
  public listDeposits(request?: DepositsApiListDepositsRequest) {
    return this.immutableX.listDeposits(request);
  }

  /**
   * Get Stark keys for a registered User
   * @param ethAddress - the eth address of the User
   * @returns a promise that resolves with the requested User
   * @throws {@link index.IMXError}
   */
  public getUser(ethAddress: string) {
    return this.immutableX.getUser(ethAddress);
  }

  /**
   * Get details of an Asset
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Asset
   * @throws {@link index.IMXError}
   */
  public getAsset(request: AssetsApiGetAssetRequest) {
    return this.immutableX.getAsset(request);
  }

  /**
   * Get a list of Assets
   * @param request - optional object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Assets
   * @throws {@link index.IMXError}
   */
  public listAssets(request?: AssetsApiListAssetsRequest) {
    return this.immutableX.listAssets(request);
  }

  /**
   * Create a Collection
   * @param ethSigner - the L1 signer
   * @param request - the request object to be provided in the API request
   * @returns a promise that resolves with the created Collection
   * @throws {@link index.IMXError}
   */
  public createCollection(
    ethSigner: EthSigner,
    request: CreateCollectionRequest,
  ) {
    return this.immutableX.createCollection(ethSigner, request);
  }

  /**
   * Get details of a Collection at the given address
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Collection
   * @throws {@link index.IMXError}
   */
  public getCollection(request: CollectionsApiGetCollectionRequest) {
    return this.immutableX.getCollection(request);
  }

  /**
   * Get a list of Collection filters
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Collection Filters
   * @throws {@link index.IMXError}
   */
  public listCollectionFilters(
    request: CollectionsApiListCollectionFiltersRequest,
  ) {
    return this.immutableX.listCollectionFilters(request);
  }

  /**
   * Get a list of Collections
   * @param request - optional object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Collections
   * @throws {@link index.IMXError}
   */
  public listCollections(request?: CollectionsApiListCollectionsRequest) {
    return this.collectionApi.listCollections(request).then((res) => res.data);
  }

  /**
   * Update a Collection
   * @param ethSigner - the L1 signer
   * @param collectionAddress - the Collection contract address
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the updated Collection
   * @throws {@link index.IMXError}
   */
  public updateCollection(
    ethSigner: EthSigner,
    collectionAddress: string,
    request: UpdateCollectionRequest,
  ) {
    return this.immutableX.updateCollection(
      ethSigner,
      collectionAddress,
      request,
    );
  }

  /**
   * Add metadata schema to Collection
   * @param ethSigner - the L1 signer
   * @param collectionAddress - the Collection contract address
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the SuccessResponse if successful
   * @throws {@link index.IMXError}
   */
  public addMetadataSchemaToCollection(
    ethSigner: EthSigner,
    collectionAddress: string,
    request: AddMetadataSchemaToCollectionRequest,
  ) {
    return this.immutableX.addMetadataSchemaToCollection(
      ethSigner,
      collectionAddress,
      request,
    );
  }

  /**
   * Get Metadata schema
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Metadata schema
   * @throws {@link index.IMXError}
   */
  public getMetadataSchema(request: MetadataApiGetMetadataSchemaRequest) {
    return this.immutableX.getMetadataSchema(request);
  }

  /**
   * Update metadata schema by name
   * @param ethSigner - the L1 signer
   * @param collectionAddress - the Collection contract address
   * @param name - the Metadata schema name
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the SuccessResponse if successful
   * @throws {@link index.IMXError}
   */
  public updateMetadataSchemaByName(
    ethSigner: EthSigner,
    collectionAddress: string,
    name: string,
    request: MetadataSchemaRequest,
  ) {
    return this.immutableX.updateMetadataSchemaByName(
      ethSigner,
      collectionAddress,
      name,
      request,
    );
  }

  /**
   * Get a list of metadata refreshes
   * @param ethSigner - the L1 signer
   * @param collectionAddress - the Collection contract address
   * @param pageSize - the page size of the result
   * @param cursor - the cursor
   * @returns a promise that resolves with the requested metadata refreshes
   * @throws {@link index.IMXError}
   */
  public listMetadataRefreshes(
    ethSigner: EthSigner,
    collectionAddress?: string,
    pageSize?: number,
    cursor?: string,
  ) {
    return this.immutableX.listMetadataRefreshes(
      ethSigner,
      collectionAddress,
      pageSize,
      cursor,
    );
  }

  /**
   * Get a list of metadata refresh errors
   * @param ethSigner - the L1 signer
   * @param refreshId - the metadata refresh ID
   * @param pageSize - the page size of the result
   * @param cursor - the cursor
   * @returns a promise that resolves with the requested metadata refresh errors
   * @throws {@link index.IMXError}
   */
  public getMetadataRefreshErrors(
    ethSigner: EthSigner,
    refreshId: string,
    pageSize?: number,
    cursor?: string,
  ) {
    return this.immutableX.getMetadataRefreshErrors(
      ethSigner,
      refreshId,
      pageSize,
      cursor,
    );
  }

  /**
   * Get a list of metadata refresh results
   * @param ethSigner - the L1 signer
   * @param refreshId - the metadata refresh ID
   * @returns a promise that resolves with the requested metadata refresh results
   * @throws {@link index.IMXError}
   */
  public getMetadataRefreshResults(ethSigner: EthSigner, refreshId: string) {
    return this.immutableX.getMetadataRefreshResults(ethSigner, refreshId);
  }

  /**
   * Request a metadata refresh
   * @param ethSigner - the L1 signer
   * @param request the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested metadata refresh
   * @throws {@link index.IMXError}
   */
  public createMetadataRefresh(
    ethSigner: EthSigner,
    request: CreateMetadataRefreshRequest,
  ) {
    return this.immutableX.createMetadataRefresh(ethSigner, request);
  }

  /**
   * Create a Project
   * @param ethSigner - the L1 signer
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the created Project
   * @throws {@link index.IMXError}
   */
  public async createProject(
    ethSigner: EthSigner,
    request: CreateProjectRequest,
  ) {
    return this.immutableX.createProject(ethSigner, request);
  }

  /**
   * Get a Project
   * @param ethSigner - the L1 signer
   * @param id - the Project ID
   * @returns a promise that resolves with the requested Project
   * @throws {@link index.IMXError}
   */
  public async getProject(ethSigner: EthSigner, id: string) {
    return this.immutableX.getProject(ethSigner, id);
  }

  /**
   * Get Projects owned by the given User
   * @param ethSigner - the L1 signer
   * @param pageSize - the page size of the result
   * @param cursor - the cursor
   * @param orderBy - the property to sort by
   * @param direction - direction to sort (asc/desc)
   * @returns a promise that resolves with the requested Projects
   * @throws {@link index.IMXError}
   */
  public async getProjects(
    ethSigner: EthSigner,
    pageSize?: number,
    cursor?: string,
    orderBy?: string,
    direction?: string,
  ) {
    return this.immutableX.getProjects(
      ethSigner,
      pageSize,
      cursor,
      orderBy,
      direction,
    );
  }

  /**
   * Get the token Balances of the User
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Balance
   * @throws {@link index.IMXError}
   */
  public getBalance(request: BalancesApiGetBalanceRequest) {
    return this.immutableX.getBalance(request);
  }

  /**
   * Get a list of Balances for given User
   * @param request the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Balances
   * @throws {@link index.IMXError}
   */
  public listBalances(request: BalancesApiListBalancesRequest) {
    return this.immutableX.listBalances(request);
  }

  /**
   * Get details of a Mint with the given ID
   * @param request the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Mint
   * @throws {@link index.IMXError}
   */
  public getMint(request: MintsApiGetMintRequest) {
    return this.immutableX.getMint(request);
  }

  /**
   * Get a list of Mints
   * @param request optional object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Mints
   * @throws {@link index.IMXError}
   */
  public listMints(request?: MintsApiListMintsRequest) {
    return this.immutableX.listMints(request);
  }

  /**
   * Mint tokens in a batch with fees
   * @param ethSigner - the L1 signer
   * @param request - the request object to be provided in the API request
   * @returns a promise that resolves with the minted tokens
   * @throws {@link index.IMXError}
   */
  public mint(ethSigner: EthSigner, request: UnsignedMintRequest) {
    return this.immutableX.mint(ethSigner, request);
  }

  /**
   * Get a list of Withdrawals
   * @param request - optional object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Withdrawals
   * @throws {@link index.IMXError}
   */
  public listWithdrawals(request?: WithdrawalsApiListWithdrawalsRequest) {
    return this.immutableX.listWithdrawals(request);
  }

  /**
   * Get details of Withdrawal with the given ID
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Withdrawal
   * @throws {@link index.IMXError}
   */
  public getWithdrawal(request: WithdrawalsApiGetWithdrawalRequest) {
    return this.immutableX.getWithdrawal(request);
  }

  /**
   * Get details of an Order with the given ID
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Order
   * @throws {@link index.IMXError}
   */
  public getOrder(request: OrdersApiGetOrderRequest) {
    return this.immutableX.getOrder(request);
  }

  /**
   * Get a list of Orders
   * @param request - optional object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Orders
   * @throws {@link index.IMXError}
   */
  public listOrders(request?: OrdersApiListOrdersRequest) {
    return this.immutableX.listOrders(request);
  }

  /**
   * Get details of a Trade with the given ID
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Trade
   * @throws {@link index.IMXError}
   */
  public getTrade(request: TradesApiGetTradeRequest) {
    return this.immutableX.getTrade(request);
  }

  /**
   * Get a list of Trades
   * @param request - optional object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Trades
   * @throws {@link index.IMXError}
   */
  public listTrades(request?: TradesApiListTradesRequest) {
    return this.immutableX.listTrades(request);
  }

  /**
   * Get details of a Token
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Token
   * @throws {@link index.IMXError}
   */
  public getToken(request: TokensApiGetTokenRequest) {
    return this.immutableX.getToken(request);
  }

  /**
   * Get a list of Tokens
   * @param request - optional object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Tokens
   * @throws {@link index.IMXError}
   */
  public listTokens(request?: TokensApiListTokensRequest) {
    return this.immutableX.listTokens(request);
  }

  /**
   * Get details of a Transfer with the given ID
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Transfer
   * @throws {@link index.IMXError}
   */
  public getTransfer(request: TransfersApiGetTransferRequest) {
    return this.immutableX.getTransfer(request);
  }

  /**
   * Get a list of Transfers
   * @param request - optional object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Transfers
   * @throws {@link index.IMXError}
   */
  public listTransfers(request?: TransfersApiListTransfersRequest) {
    return this.immutableX.listTransfers(request);
  }

  /**
   * Create a new Exchange transaction
   * @param request - the request object to be provided in the API request
   * @returns a promise that resolves with the created Exchange Transaction
   * @throws {@link index.IMXError}
   */
  public createExchange(request: ExchangesApiCreateExchangeRequest) {
    return this.immutableX.createExchange(request).then((res) => res.data);
  }

  /**
   * Get an Exchange transaction
   * @param request - the request object to be provided in the API request
   * @returns a promise that resolves with the Exchange Transaction
   * @throws {@link index.IMXError}
   */
  public getExchange(request: ExchangesApiGetExchangeRequest) {
    return this.immutableX.getExchange(request).then((res) => res.data);
  }

  /**
   * Get Exchange transactions
   * @param request - the request object to be provided in the API request
   * @returns a promise that resolves with Exchange Transactions
   * @throws {@link index.IMXError}
   */
  public getExchanges(request: ExchangesApiGetExchangesRequest) {
    return this.immutableX.getExchanges(request).then((res) => res.data);
  }

  /**
   * Create a new Transfer request
   * @param walletConnection - the pair of Eth/Stark signers
   * @param request - the request object to be provided in the API request
   * @returns a promise that resolves with the created Exchange Transfer
   * @throws {@link index.IMXError}
   */
  public exchangeTransfer(
    walletConnection: WalletConnection,
    request: UnsignedExchangeTransferRequest,
  ) {
    return this.immutableX.exchangeTransfer(walletConnection, request);
  }

  /**
   * Create a new nft primary transaction
   * @param request - the request object to be provided in the API request
   * @returns a promise that resolves with the created nft primary Transaction
   * @throws {@link index.IMXError}
   */
  public createNftPrimary(
    request: NftCheckoutPrimaryApiCreateNftPrimaryRequest,
  ) {
    return this.immutableX.createNftPrimary(request).then((res) => res.data);
  }

  /**
   * Get nft primary supported currencies and their limits
   * @param request - the request object to be provided in the API request
   * @returns a promise that resolves with nft primary Currencies
   * @throws {@link index.IMXError}
   */
  public getCurrenciesNFTCheckoutPrimary(
    request: NftCheckoutPrimaryApiGetCurrenciesNFTCheckoutPrimaryRequest,
  ) {
    return this.immutableX
      .getCurrenciesNFTCheckoutPrimary(request)
      .then((res) => res.data);
  }

  /**
   * Get nft primary transaction by transaction id
   * @param request - the request object to be provided in the API request
   * @returns a promise that resolves with nft primary transaction
   * @throws {@link index.IMXError}
   */
  public getNftPrimaryTransaction(
    request: NftCheckoutPrimaryApiGetNftPrimaryTransactionRequest,
  ) {
    return this.immutableX
      .getNftPrimaryTransaction(request)
      .then((res) => res.data);
  }

  /**
   * Get list of nft primary transactions
   * @param request - the request object to be provided in the API request
   * @returns a promise that resolves with nft primary transaction
   * @throws {@link index.IMXError}
   */
  public getNftPrimaryTransactions(
    request: NftCheckoutPrimaryApiGetNftPrimaryTransactionsRequest,
  ) {
    return this.immutableX
      .getNftPrimaryTransactions(request)
      .then((res) => res.data);
  }
}
