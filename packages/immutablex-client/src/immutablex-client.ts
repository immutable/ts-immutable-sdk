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
} from '@imtbl/generated-clients/src/imx';
import { formatError } from './utils';
import {
  EthSigner,
  UnsignedExchangeTransferRequest,
  UnsignedMintRequest,
  WalletConnection,
} from './types';
import { ImmutableXConfiguration, ImxConfiguration, ImxModuleConfiguration } from './config';
import { Workflows } from './workflows';

export class ImmutableXClient {
  public config: ImmutableXConfiguration;

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

  private workflows: Workflows;

  constructor(config: ImxModuleConfiguration) {
    this.config = new ImxConfiguration(config).immutableXConfig;
    this.workflows = new Workflows(this.config);
    this.depositsApi = new DepositsApi(this.config.apiConfiguration);
    this.mintsApi = new MintsApi(this.config.apiConfiguration);
    this.ordersApi = new OrdersApi(this.config.apiConfiguration);
    this.tokensApi = new TokensApi(this.config.apiConfiguration);
    this.tradesApi = new TradesApi(this.config.apiConfiguration);
    this.transfersApi = new TransfersApi(this.config.apiConfiguration);
    this.exchangeApi = new ExchangesApi(this.config.apiConfiguration);
    this.usersApi = new UsersApi(this.config.apiConfiguration);
    this.withdrawalsApi = new WithdrawalsApi(this.config.apiConfiguration);
    this.balanceApi = new BalancesApi(this.config.apiConfiguration);
    this.assetApi = new AssetsApi(this.config.apiConfiguration);
    this.collectionApi = new CollectionsApi(this.config.apiConfiguration);
    this.metadataApi = new MetadataApi(this.config.apiConfiguration);
    this.metadataRefreshesApi = new MetadataRefreshesApi(this.config.apiConfiguration);
    this.nftCheckoutPrimaryApi = new NftCheckoutPrimaryApi(this.config.apiConfiguration);
    this.projectsApi = new ProjectsApi(this.config.apiConfiguration);
  }

  /**
   * Get details of a Deposit with the given ID
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Deposit
   * @throws {@link index.IMXError}
   */
  public getDeposit(request: DepositsApiGetDepositRequest) {
    return this.depositsApi
      .getDeposit(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get a list of Deposits
   * @param request - optional object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Deposits
   * @throws {@link index.IMXError}
   */
  public listDeposits(request?: DepositsApiListDepositsRequest) {
    return this.depositsApi
      .listDeposits(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get Stark keys for a registered User
   * @param ethAddress - the eth address of the User
   * @returns a promise that resolves with the requested User
   * @throws {@link index.IMXError}
   */
  public getUser(ethAddress: string) {
    return this.usersApi
      .getUsers({ user: ethAddress })
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get details of an Asset
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Asset
   * @throws {@link index.IMXError}
   */
  public getAsset(request: AssetsApiGetAssetRequest) {
    return this.assetApi
      .getAsset(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get a list of Assets
   * @param request - optional object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Assets
   * @throws {@link index.IMXError}
   */
  public listAssets(request?: AssetsApiListAssetsRequest) {
    return this.assetApi
      .listAssets(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
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
    return this.workflows
      .createCollection(ethSigner, request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get details of a Collection at the given address
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Collection
   * @throws {@link index.IMXError}
   */
  public getCollection(request: CollectionsApiGetCollectionRequest) {
    return this.collectionApi
      .getCollection(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
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
    return this.collectionApi
      .listCollectionFilters(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get a list of Collections
   * @param request - optional object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Collections
   * @throws {@link index.IMXError}
   */
  public listCollections(request?: CollectionsApiListCollectionsRequest) {
    return this.collectionApi.listCollections(request).then((res) => res.data).catch((err) => {
      throw formatError(err);
    });
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
    return this.workflows
      .updateCollection(ethSigner, collectionAddress, request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
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
    return this.workflows
      .addMetadataSchemaToCollection(ethSigner, collectionAddress, request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get Metadata schema
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Metadata schema
   * @throws {@link index.IMXError}
   */
  public getMetadataSchema(request: MetadataApiGetMetadataSchemaRequest) {
    return this.metadataApi
      .getMetadataSchema(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
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
    return this.workflows
      .updateMetadataSchemaByName(ethSigner, collectionAddress, name, request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
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
    return this.workflows
      .listMetadataRefreshes(ethSigner, collectionAddress, pageSize, cursor)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
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
    return this.workflows
      .getMetadataRefreshErrors(ethSigner, refreshId, pageSize, cursor)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get a list of metadata refresh results
   * @param ethSigner - the L1 signer
   * @param refreshId - the metadata refresh ID
   * @returns a promise that resolves with the requested metadata refresh results
   * @throws {@link index.IMXError}
   */
  public getMetadataRefreshResults(ethSigner: EthSigner, refreshId: string) {
    return this.workflows
      .getMetadataRefreshResults(ethSigner, refreshId)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
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
    return this.workflows
      .createMetadataRefresh(ethSigner, request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
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
    return this.workflows
      .createProject(ethSigner, request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get a Project
   * @param ethSigner - the L1 signer
   * @param id - the Project ID
   * @returns a promise that resolves with the requested Project
   * @throws {@link index.IMXError}
   */
  public async getProject(ethSigner: EthSigner, id: string) {
    return this.workflows
      .getProject(ethSigner, id)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
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
    return this.workflows
      .getProjects(ethSigner, pageSize, cursor, orderBy, direction)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get the token Balances of the User
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Balance
   * @throws {@link index.IMXError}
   */
  public getBalance(request: BalancesApiGetBalanceRequest) {
    return this.balanceApi
      .getBalance(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get a list of Balances for given User
   * @param request the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Balances
   * @throws {@link index.IMXError}
   */
  public listBalances(request: BalancesApiListBalancesRequest) {
    return this.balanceApi
      .listBalances(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get details of a Mint with the given ID
   * @param request the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Mint
   * @throws {@link index.IMXError}
   */
  public getMint(request: MintsApiGetMintRequest) {
    return this.mintsApi
      .getMint(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get a list of Mints
   * @param request optional object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Mints
   * @throws {@link index.IMXError}
   */
  public listMints(request?: MintsApiListMintsRequest) {
    return this.mintsApi
      .listMints(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Mint tokens in a batch with fees
   * @param ethSigner - the L1 signer
   * @param request - the request object to be provided in the API request
   * @returns a promise that resolves with the minted tokens
   * @throws {@link index.IMXError}
   */
  public mint(ethSigner: EthSigner, request: UnsignedMintRequest) {
    return this.workflows.mint(ethSigner, request).catch((err) => {
      throw formatError(err);
    });
  }

  /**
   * Get a list of Withdrawals
   * @param request - optional object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Withdrawals
   * @throws {@link index.IMXError}
   */
  public listWithdrawals(request?: WithdrawalsApiListWithdrawalsRequest) {
    return this.withdrawalsApi
      .listWithdrawals(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get details of Withdrawal with the given ID
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Withdrawal
   * @throws {@link index.IMXError}
   */
  public getWithdrawal(request: WithdrawalsApiGetWithdrawalRequest) {
    return this.withdrawalsApi
      .getWithdrawal(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get details of an Order with the given ID
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Order
   * @throws {@link index.IMXError}
   */
  public getOrder(request: OrdersApiGetOrderRequest) {
    return this.ordersApi
      .getOrder(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get a list of Orders
   * @param request - optional object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Orders
   * @throws {@link index.IMXError}
   */
  public listOrders(request?: OrdersApiListOrdersRequest) {
    return this.ordersApi
      .listOrders(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get details of a Trade with the given ID
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Trade
   * @throws {@link index.IMXError}
   */
  public getTrade(request: TradesApiGetTradeRequest) {
    return this.tradesApi
      .getTrade(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get a list of Trades
   * @param request - optional object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Trades
   * @throws {@link index.IMXError}
   */
  public listTrades(request?: TradesApiListTradesRequest) {
    return this.tradesApi
      .listTrades(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get details of a Token
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Token
   * @throws {@link index.IMXError}
   */
  public getToken(request: TokensApiGetTokenRequest) {
    return this.tokensApi
      .getToken(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get a list of Tokens
   * @param request - optional object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Tokens
   * @throws {@link index.IMXError}
   */
  public listTokens(request?: TokensApiListTokensRequest) {
    return this.tokensApi
      .listTokens(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get details of a Transfer with the given ID
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Transfer
   * @throws {@link index.IMXError}
   */
  public getTransfer(request: TransfersApiGetTransferRequest) {
    return this.transfersApi
      .getTransfer(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get a list of Transfers
   * @param request - optional object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Transfers
   * @throws {@link index.IMXError}
   */
  public listTransfers(request?: TransfersApiListTransfersRequest) {
    return this.transfersApi
      .listTransfers(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Create a new Exchange transaction
   * @param request - the request object to be provided in the API request
   * @returns a promise that resolves with the created Exchange Transaction
   * @throws {@link index.IMXError}
   */
  public createExchange(request: ExchangesApiCreateExchangeRequest) {
    return this.exchangeApi.createExchange(request).catch((err) => {
      throw formatError(err);
    });
  }

  /**
   * Get an Exchange transaction
   * @param request - the request object to be provided in the API request
   * @returns a promise that resolves with the Exchange Transaction
   * @throws {@link index.IMXError}
   */
  public getExchange(request: ExchangesApiGetExchangeRequest) {
    return this.exchangeApi.getExchange(request).catch((err) => {
      throw formatError(err);
    });
  }

  /**
   * Get Exchange transactions
   * @param request - the request object to be provided in the API request
   * @returns a promise that resolves with Exchange Transactions
   * @throws {@link index.IMXError}
   */
  public getExchanges(request: ExchangesApiGetExchangesRequest) {
    return this.exchangeApi.getExchanges(request).catch((err) => {
      throw formatError(err);
    });
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
    return this.workflows
      .exchangeTransfer(walletConnection, request)
      .catch((err) => {
        throw formatError(err);
      });
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
    return this.nftCheckoutPrimaryApi.createNftPrimary(request).catch((err) => {
      throw formatError(err);
    });
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
    return this.nftCheckoutPrimaryApi
      .getCurrenciesNFTCheckoutPrimary(request)
      .catch((err) => {
        throw formatError(err);
      });
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
    return this.nftCheckoutPrimaryApi
      .getNftPrimaryTransaction(request)
      .catch((err) => {
        throw formatError(err);
      });
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
    return this.nftCheckoutPrimaryApi
      .getNftPrimaryTransactions(request)
      .catch((err) => {
        throw formatError(err);
      });
  }
}
