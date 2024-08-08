import { ImxApiClients } from '@imtbl/generated-clients';
import {
  ImxConfiguration,
  ImxModuleConfiguration,
} from './config';
import { formatError } from './utils/formatError';
import type {
  AddMetadataSchemaToCollectionRequest,
  Asset,
  AssetsApi,
  AssetsApiGetAssetRequest,
  AssetsApiListAssetsRequest,
  Balance,
  BalancesApi,
  BalancesApiGetBalanceRequest,
  BalancesApiListBalancesRequest,
  Collection,
  CollectionFilter,
  CollectionsApi,
  CollectionsApiGetCollectionRequest,
  CollectionsApiListCollectionFiltersRequest,
  CollectionsApiListCollectionsRequest,
  CreateCollectionRequest,
  CreateMetadataRefreshRequest,
  CreateMetadataRefreshResponse,
  CreateTransferResponseV1,
  CurrencyWithLimits,
  Deposit,
  DepositsApi,
  DepositsApiGetDepositRequest,
  DepositsApiListDepositsRequest,
  EncodingApi,
  EthSigner,
  Exchange,
  ExchangeCreateExchangeAndURLResponse,
  ExchangesApi,
  ExchangesApiCreateExchangeRequest,
  ExchangesApiGetExchangeRequest,
  ExchangesApiGetExchangesRequest,
  GetMetadataRefreshErrorsResponse,
  GetMetadataRefreshes,
  GetMetadataRefreshResponse,
  GetTransactionsResponse,
  GetUsersApiResponse,
  ListAssetsResponse,
  ListBalancesResponse,
  ListCollectionsResponse,
  ListDepositsResponse,
  ListMintsResponse,
  ListOrdersResponseV3,
  ListTokensResponse,
  ListTradesResponse,
  ListTransfersResponse,
  ListWithdrawalsResponse,
  MetadataApi,
  MetadataApiGetMetadataSchemaRequest,
  MetadataRefreshesApi,
  MetadataSchemaProperty,
  MetadataSchemaRequest,
  Mint,
  MintsApi,
  MintsApiGetMintRequest,
  MintsApiListMintsRequest,
  MintTokensResponse,
  NftCheckoutPrimaryApi,
  NftCheckoutPrimaryApiCreateNftPrimaryRequest,
  NftCheckoutPrimaryApiGetCurrenciesNFTCheckoutPrimaryRequest,
  NftCheckoutPrimaryApiGetNftPrimaryTransactionRequest,
  NftCheckoutPrimaryApiGetNftPrimaryTransactionsRequest,
  NftprimarytransactionCreateResponse,
  NftprimarytransactionGetResponse,
  NftprimarytransactionListTransactionsResponse,
  OrdersApi,
  OrdersApiGetOrderV3Request,
  OrdersApiListOrdersV3Request,
  OrderV3,
  PrimarySalesApi,
  PrimarySalesApiSignableCreatePrimarySaleRequest,
  Project,
  ProjectsApi,
  SuccessResponse,
  TokenDetails,
  TokensApi,
  TokensApiGetTokenRequest,
  TokensApiListTokensRequest,
  Trade,
  TradesApi,
  TradesApiGetTradeV3Request,
  TradesApiListTradesV3Request,
  Transfer,
  TransfersApi,
  TransfersApiGetTransferRequest,
  TransfersApiListTransfersRequest,
  UnsignedExchangeTransferRequest,
  UnsignedMintRequest,
  UpdateCollectionRequest,
  UsersApi,
  WalletConnection,
  Withdrawal,
  WithdrawalsApi,
  WithdrawalsApiGetWithdrawalRequest,
  WithdrawalsApiListWithdrawalsRequest,
} from './types';
import type {
  AcceptPrimarySaleResponse,
  CreatePrimarySaleResponse,
  RejectPrimarySaleResponse,
} from './workflows';
import { Workflows } from './workflows';

export class IMXClient {
  private immutableX: ImxApiClients;

  public imxConfig: ImxConfiguration;

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

  public primarySalesApi: PrimarySalesApi;

  public projectsApi: ProjectsApi;

  public tokensApi: TokensApi;

  public tradesApi: TradesApi;

  public transfersApi: TransfersApi;

  public usersApi: UsersApi;

  public withdrawalsApi: WithdrawalsApi;

  public workflows: Workflows;

  constructor(config: ImxModuleConfiguration) {
    this.imxConfig = new ImxConfiguration(config);
    this.immutableX = new ImxApiClients(this.imxConfig.immutableXConfig.apiConfiguration);
    this.assetApi = this.immutableX.assetApi;
    this.balanceApi = this.immutableX.balanceApi;
    this.collectionApi = this.immutableX.collectionApi;
    this.depositsApi = this.immutableX.depositsApi;
    this.encodingApi = this.immutableX.encodingApi;
    this.exchangeApi = this.immutableX.exchangeApi;
    this.metadataApi = this.immutableX.metadataApi;
    this.metadataRefreshesApi = this.immutableX.metadataRefreshesApi;
    this.mintsApi = this.immutableX.mintsApi;
    this.nftCheckoutPrimaryApi = this.immutableX.nftCheckoutPrimaryApi;
    this.ordersApi = this.immutableX.ordersApi;
    this.primarySalesApi = this.immutableX.primarySalesApi;
    this.projectsApi = this.immutableX.projectsApi;
    this.tokensApi = this.immutableX.tokensApi;
    this.tradesApi = this.immutableX.tradesApi;
    this.transfersApi = this.immutableX.transfersApi;
    this.usersApi = this.immutableX.usersApi;
    this.withdrawalsApi = this.immutableX.withdrawalsApi;
    this.workflows = new Workflows(
      this.imxConfig.immutableXConfig,
      this.immutableX.collectionApi,
      this.immutableX.exchangeApi,
      this.immutableX.metadataApi,
      this.immutableX.metadataRefreshesApi,
      this.immutableX.mintsApi,
      this.immutableX.primarySalesApi,
      this.immutableX.projectsApi,
    );
  }

  /**
   * Get details of a Deposit with the given ID
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Deposit
   * @throws {@link IMXError}
   */
  public getDeposit(request: DepositsApiGetDepositRequest): Promise<Deposit> {
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
   * @throws {@link IMXError}
   */
  public listDeposits(request?: DepositsApiListDepositsRequest): Promise<ListDepositsResponse> {
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
   * @throws {@link IMXError}
   */
  public getUser(ethAddress: string): Promise<GetUsersApiResponse> {
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
   * @throws {@link IMXError}
   */
  public getAsset(request: AssetsApiGetAssetRequest): Promise<Asset> {
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
   * @throws {@link IMXError}
   */
  public listAssets(request?: AssetsApiListAssetsRequest): Promise<ListAssetsResponse> {
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
   * @throws {@link IMXError}
   */
  public createCollection(
    ethSigner: EthSigner,
    request: CreateCollectionRequest,
  ): Promise<Collection> {
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
   * @throws {@link IMXError}
   */
  public getCollection(request: CollectionsApiGetCollectionRequest): Promise<Collection> {
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
   * @throws {@link IMXError}
   */
  public listCollectionFilters(
    request: CollectionsApiListCollectionFiltersRequest,
  ): Promise<CollectionFilter[]> {
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
   * @throws {@link IMXError}
   */
  public listCollections(
    request?: CollectionsApiListCollectionsRequest,
  ): Promise<ListCollectionsResponse> {
    return this.collectionApi
      .listCollections(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Update a Collection
   * @param ethSigner - the L1 signer
   * @param collectionAddress - the Collection contract address
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the updated Collection
   * @throws {@link IMXError}
   */
  public updateCollection(
    ethSigner: EthSigner,
    collectionAddress: string,
    request: UpdateCollectionRequest,
  ): Promise<Collection> {
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
   * @throws {@link IMXError}
   */
  public addMetadataSchemaToCollection(
    ethSigner: EthSigner,
    collectionAddress: string,
    request: AddMetadataSchemaToCollectionRequest,
  ): Promise<SuccessResponse> {
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
   * @throws {@link IMXError}
   */
  public getMetadataSchema(
    request: MetadataApiGetMetadataSchemaRequest,
  ): Promise<MetadataSchemaProperty[]> {
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
   * @returns a promise that resolves with the {@link SuccessResponse}
   * @throws {@link IMXError}
   */
  public updateMetadataSchemaByName(
    ethSigner: EthSigner,
    collectionAddress: string,
    name: string,
    request: MetadataSchemaRequest,
  ): Promise<SuccessResponse> {
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
   * @throws {@link IMXError}
   */
  public listMetadataRefreshes(
    ethSigner: EthSigner,
    collectionAddress?: string,
    pageSize?: number,
    cursor?: string,
  ): Promise<GetMetadataRefreshes> {
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
   * @throws {@link IMXError}
   */
  public getMetadataRefreshErrors(
    ethSigner: EthSigner,
    refreshId: string,
    pageSize?: number,
    cursor?: string,
  ): Promise<GetMetadataRefreshErrorsResponse> {
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
   * @throws {@link IMXError}
   */
  public getMetadataRefreshResults(
    ethSigner: EthSigner,
    refreshId: string,
  ): Promise<GetMetadataRefreshResponse> {
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
   * @throws {@link IMXError}
   */
  public createMetadataRefresh(
    ethSigner: EthSigner,
    request: CreateMetadataRefreshRequest,
  ): Promise<CreateMetadataRefreshResponse> {
    return this.workflows
      .createMetadataRefresh(ethSigner, request)
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
   * @throws {@link IMXError}
   */
  public async getProject(ethSigner: EthSigner, id: string): Promise<Project> {
    return this.workflows
      .getProject(ethSigner, id)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get the token Balances of the User
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Balance
   * @throws {@link IMXError}
   */
  public getBalance(request: BalancesApiGetBalanceRequest): Promise<Balance> {
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
   * @throws {@link IMXError}
   */
  public listBalances(
    request: BalancesApiListBalancesRequest,
  ): Promise<ListBalancesResponse> {
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
   * @throws {@link IMXError}
   */
  public getMint(request: MintsApiGetMintRequest): Promise<Mint[]> {
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
   * @throws {@link IMXError}
   */
  public listMints(request?: MintsApiListMintsRequest): Promise<ListMintsResponse> {
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
   * @throws {@link IMXError}
   */
  public mint(
    ethSigner: EthSigner,
    request: UnsignedMintRequest,
  ): Promise<MintTokensResponse> {
    return this.workflows.mint(ethSigner, request);
  }

  /**
   * Get a list of Withdrawals
   * @param request - optional object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Withdrawals
   * @throws {@link IMXError}
   */
  public listWithdrawals(
    request?: WithdrawalsApiListWithdrawalsRequest,
  ): Promise<ListWithdrawalsResponse> {
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
   * @throws {@link IMXError}
   */
  public getWithdrawal(request: WithdrawalsApiGetWithdrawalRequest): Promise<Withdrawal> {
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
   * @throws {@link IMXError}
   */
  public getOrder(request: OrdersApiGetOrderV3Request): Promise<OrderV3> {
    return this.ordersApi
      .getOrderV3(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get a list of Orders
   * @param request - optional object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Orders
   * @throws {@link IMXError}
   */
  public listOrders(request?: OrdersApiListOrdersV3Request): Promise<ListOrdersResponseV3> {
    return this.ordersApi
      .listOrdersV3(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get details of a Trade with the given ID
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Trade
   * @throws {@link IMXError}
   */
  public getTrade(request: TradesApiGetTradeV3Request): Promise<Trade> {
    return this.tradesApi
      .getTradeV3(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get a list of Trades
   * @param request - optional object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Trades
   * @throws {@link IMXError}
   */
  public listTrades(request?: TradesApiListTradesV3Request): Promise<ListTradesResponse> {
    return this.tradesApi
      .listTradesV3(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get details of a Token
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Token
   * @throws {@link IMXError}
   */
  public getToken(request: TokensApiGetTokenRequest): Promise<TokenDetails> {
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
   * @throws {@link IMXError}
   */
  public listTokens(request?: TokensApiListTokensRequest): Promise<ListTokensResponse> {
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
   * @throws {@link IMXError}
   */
  public getTransfer(request: TransfersApiGetTransferRequest): Promise<Transfer> {
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
   * @throws {@link IMXError}
   */
  public listTransfers(
    request?: TransfersApiListTransfersRequest,
  ): Promise<ListTransfersResponse> {
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
   * @throws {@link IMXError}
   */
  public createExchange(
    request: ExchangesApiCreateExchangeRequest,
  ): Promise<ExchangeCreateExchangeAndURLResponse> {
    return this.exchangeApi.createExchange(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get an Exchange transaction
   * @param request - the request object to be provided in the API request
   * @returns a promise that resolves with the Exchange Transaction
   * @throws {@link IMXError}
   */
  public getExchange(request: ExchangesApiGetExchangeRequest): Promise<Exchange> {
    return this.exchangeApi.getExchange(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get Exchange transactions
   * @param request - the request object to be provided in the API request
   * @returns a promise that resolves with Exchange Transactions
   * @throws {@link IMXError}
   */
  public getExchanges(request: ExchangesApiGetExchangesRequest): Promise<GetTransactionsResponse> {
    return this.exchangeApi.getExchanges(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Create a new Transfer request
   * @param walletConnection - the pair of Eth/Stark signers
   * @param request - the request object to be provided in the API request
   * @returns a promise that resolves with the created Exchange Transfer
   * @throws {@link IMXError}
   */
  public exchangeTransfer(
    walletConnection: WalletConnection,
    request: UnsignedExchangeTransferRequest,
  ): Promise<CreateTransferResponseV1> {
    return this.workflows.exchangeTransfer(walletConnection, request);
  }

  /**
   * Create a new nft primary transaction
   * @param request - the request object to be provided in the API request
   * @returns a promise that resolves with the created nft primary Transaction
   * @throws {@link IMXError}
   */
  public createNftPrimary(
    request: NftCheckoutPrimaryApiCreateNftPrimaryRequest,
  ): Promise<NftprimarytransactionCreateResponse> {
    return this.nftCheckoutPrimaryApi.createNftPrimary(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get nft primary supported currencies and their limits
   * @param request - the request object to be provided in the API request
   * @returns a promise that resolves with nft primary Currencies
   * @throws {@link IMXError}
   */
  public getCurrenciesNFTCheckoutPrimary(
    request: NftCheckoutPrimaryApiGetCurrenciesNFTCheckoutPrimaryRequest,
  ): Promise<CurrencyWithLimits> {
    return this.nftCheckoutPrimaryApi
      .getCurrenciesNFTCheckoutPrimary(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get nft primary transaction by transaction id
   * @param request - the request object to be provided in the API request
   * @returns a promise that resolves with nft primary transaction
   * @throws {@link IMXError}
   */
  public getNftPrimaryTransaction(
    request: NftCheckoutPrimaryApiGetNftPrimaryTransactionRequest,
  ): Promise<NftprimarytransactionGetResponse> {
    return this.nftCheckoutPrimaryApi
      .getNftPrimaryTransaction(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get list of nft primary transactions
   * @param request - the request object to be provided in the API request
   * @returns a promise that resolves with nft primary transaction
   * @throws {@link IMXError}
   */
  public getNftPrimaryTransactions(
    request: NftCheckoutPrimaryApiGetNftPrimaryTransactionsRequest,
  ): Promise<NftprimarytransactionListTransactionsResponse> {
    return this.nftCheckoutPrimaryApi
      .getNftPrimaryTransactions(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Create a PrimarySale
   * @param walletConnection - the pair of L1/L2 signers
   * @param request - the request object to be provided in the API request
   * @returns a promise that resolves with the created Trade
   * @throws {@link IMXError}
   */
  public createPrimarySale(
    walletConnection: WalletConnection,
    request: PrimarySalesApiSignableCreatePrimarySaleRequest,
  ): Promise<CreatePrimarySaleResponse> {
    return this.workflows
      .createPrimarySale(walletConnection, request)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Accept a PrimarySale
   * @param ethSigner - eth signer matching the 'studio_ether_key' of the primary sale
   * @param primarySaleId - id of the primary sale accepting
   * @returns a promise that resolves with the created Trade
   * @throws {@link IMXError}
   */
  public acceptPrimarySale(
    ethSigner: EthSigner,
    primarySaleId: number,
  ): Promise<AcceptPrimarySaleResponse> {
    return this.workflows
      .acceptPrimarySale(ethSigner, primarySaleId)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Reject a PrimarySale
   * @param ethSigner - eth signer matching the 'studio_ether_key' of the primary sale
   * @param primarySaleId - id of the primary sale to be rejected
   * @returns a promise that resolves with the rejected PrimarySale
   * @throws {@link IMXError}
   */
  public rejectPrimarySale(
    ethSigner: EthSigner,
    primarySaleId: number,
  ): Promise<RejectPrimarySaleResponse> {
    return this.workflows
      .rejectPrimarySale(ethSigner, primarySaleId)
      .catch((err) => {
        throw formatError(err);
      });
  }
}

export class ImmutableX extends IMXClient {}
