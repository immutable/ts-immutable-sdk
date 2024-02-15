import { ImxApiClients } from '@imtbl/generated-clients';
import { ImxConfiguration, ImxModuleConfiguration } from './config';
import { formatError } from './utils/formatError';
import {
  // ImmutableX,
  // EthSigner,
  // generateLegacyStarkPrivateKey,
  // createStarkSigner,
  // UnsignedExchangeTransferRequest,
  // UnsignedMintRequest,
  // WalletConnection,
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
  EncodingApi,
  DepositsApiGetDepositRequest,
  DepositsApiListDepositsRequest,
  AssetsApiGetAssetRequest,
  AssetsApiListAssetsRequest,
  // CreateCollectionRequest,
  CollectionsApiGetCollectionRequest,
  CollectionsApiListCollectionFiltersRequest,
  CollectionsApiListCollectionsRequest,
  // UpdateCollectionRequest,
  // AddMetadataSchemaToCollectionRequest,
  MetadataApiGetMetadataSchemaRequest,
  // MetadataSchemaRequest,
  BalancesApiGetBalanceRequest,
  BalancesApiListBalancesRequest,
  MintsApiGetMintRequest,
  MintsApiListMintsRequest,
  WithdrawalsApiListWithdrawalsRequest,
  WithdrawalsApiGetWithdrawalRequest,
  OrdersApiGetOrderV3Request,
  OrdersApiListOrdersV3Request,
  TradesApiGetTradeV3Request,
  TradesApiListTradesV3Request,
  TokensApiGetTokenRequest,
  TokensApiListTokensRequest,
  TransfersApiGetTransferRequest,
  TransfersApiListTransfersRequest,
  MetadataRefreshesApi,
  // CreateMetadataRefreshRequest,
  ExchangesApi,
  ExchangesApiCreateExchangeRequest,
  ExchangesApiGetExchangeRequest,
  ExchangesApiGetExchangesRequest,
  NftCheckoutPrimaryApi,
  NftCheckoutPrimaryApiCreateNftPrimaryRequest,
  NftCheckoutPrimaryApiGetCurrenciesNFTCheckoutPrimaryRequest,
  NftCheckoutPrimaryApiGetNftPrimaryTransactionRequest,
  NftCheckoutPrimaryApiGetNftPrimaryTransactionsRequest,
} from './types';

export class IMXClient {
  private immutableX: ImxApiClients;

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

  constructor(config: ImxModuleConfiguration) {
    const imxConfig = new ImxConfiguration(config);
    this.immutableX = new ImxApiClients(imxConfig.immutableXConfig.apiConfiguration);
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
    this.projectsApi = this.immutableX.projectsApi;
    this.tokensApi = this.immutableX.tokensApi;
    this.tradesApi = this.immutableX.tradesApi;
    this.transfersApi = this.immutableX.transfersApi;
    this.usersApi = this.immutableX.usersApi;
    this.withdrawalsApi = this.immutableX.withdrawalsApi;
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

  // /**
  //  * Create a Collection
  //  * @param ethSigner - the L1 signer
  //  * @param request - the request object to be provided in the API request
  //  * @returns a promise that resolves with the created Collection
  //  * @throws {@link index.IMXError}
  //  */
  // public createCollection(
  //   ethSigner: EthSigner,
  //   request: CreateCollectionRequest,
  // ) {
  //   // TODO - workflow
  //   return this.collectionApi.createCollection(ethSigner, request);
  // }

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
    return this.collectionApi
      .listCollections(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  // /**
  //  * Update a Collection
  //  * @param ethSigner - the L1 signer
  //  * @param collectionAddress - the Collection contract address
  //  * @param request - the request object containing the parameters to be provided in the API request
  //  * @returns a promise that resolves with the updated Collection
  //  * @throws {@link index.IMXError}
  //  */
  // public updateCollection(
  //   ethSigner: EthSigner,
  //   collectionAddress: string,
  //   request: UpdateCollectionRequest,
  // ) {
  //   // TODO - workflow
  //   return this.collectionApi.updateCollection(
  //     ethSigner,
  //     collectionAddress,
  //     request,
  //   );
  // }

  // /**
  //  * Add metadata schema to Collection
  //  * @param ethSigner - the L1 signer
  //  * @param collectionAddress - the Collection contract address
  //  * @param request - the request object containing the parameters to be provided in the API request
  //  * @returns a promise that resolves with the SuccessResponse if successful
  //  * @throws {@link index.IMXError}
  //  */
  // public addMetadataSchemaToCollection(
  //   ethSigner: EthSigner,
  //   collectionAddress: string,
  //   request: AddMetadataSchemaToCollectionRequest,
  // ) {
  //   // TODO - workflow
  //   return this.metadataApi.addMetadataSchemaToCollection(
  //     ethSigner,
  //     collectionAddress,
  //     request,
  //   );
  // }

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

  // /**
  //  * Update metadata schema by name
  //  * @param ethSigner - the L1 signer
  //  * @param collectionAddress - the Collection contract address
  //  * @param name - the Metadata schema name
  //  * @param request - the request object containing the parameters to be provided in the API request
  //  * @returns a promise that resolves with the SuccessResponse if successful
  //  * @throws {@link index.IMXError}
  //  */
  // public updateMetadataSchemaByName(
  //   ethSigner: EthSigner,
  //   collectionAddress: string,
  //   name: string,
  //   request: MetadataSchemaRequest,
  // ) {
  //   // TODO - workflow
  //   return this.immutableX.updateMetadataSchemaByName(
  //     ethSigner,
  //     collectionAddress,
  //     name,
  //     request,
  //   );
  // }

  // /**
  //  * Get a list of metadata refreshes
  //  * @param ethSigner - the L1 signer
  //  * @param collectionAddress - the Collection contract address
  //  * @param pageSize - the page size of the result
  //  * @param cursor - the cursor
  //  * @returns a promise that resolves with the requested metadata refreshes
  //  * @throws {@link index.IMXError}
  //  */
  // public listMetadataRefreshes(
  //   ethSigner: EthSigner,
  //   collectionAddress?: string,
  //   pageSize?: number,
  //   cursor?: string,
  // ) {
  //   // TODO - workflow
  //   return this.immutableX.listMetadataRefreshes(
  //     ethSigner,
  //     collectionAddress,
  //     pageSize,
  //     cursor,
  //   );
  // }

  // /**
  //  * Get a list of metadata refresh errors
  //  * @param ethSigner - the L1 signer
  //  * @param refreshId - the metadata refresh ID
  //  * @param pageSize - the page size of the result
  //  * @param cursor - the cursor
  //  * @returns a promise that resolves with the requested metadata refresh errors
  //  * @throws {@link index.IMXError}
  //  */
  // public getMetadataRefreshErrors(
  //   ethSigner: EthSigner,
  //   refreshId: string,
  //   pageSize?: number,
  //   cursor?: string,
  // ) {
  //   // TODO - workflow
  //   return this.immutableX.getMetadataRefreshErrors(
  //     ethSigner,
  //     refreshId,
  //     pageSize,
  //     cursor,
  //   );
  // }

  // /**
  //  * Get a list of metadata refresh results
  //  * @param ethSigner - the L1 signer
  //  * @param refreshId - the metadata refresh ID
  //  * @returns a promise that resolves with the requested metadata refresh results
  //  * @throws {@link index.IMXError}
  //  */
  // public getMetadataRefreshResults(ethSigner: EthSigner, refreshId: string) {
  //   // TODO - workflow
  //   return this.immutableX.getMetadataRefreshResults(ethSigner, refreshId);
  // }

  // /**
  //  * Request a metadata refresh
  //  * @param ethSigner - the L1 signer
  //  * @param request the request object containing the parameters to be provided in the API request
  //  * @returns a promise that resolves with the requested metadata refresh
  //  * @throws {@link index.IMXError}
  //  */
  // public createMetadataRefresh(
  //   ethSigner: EthSigner,
  //   request: CreateMetadataRefreshRequest,
  // ) {
  //   // TODO - workflow
  //   return this.immutableX.createMetadataRefresh(ethSigner, request);
  // }

  // /**
  //  * Get a Project
  //  * @param ethSigner - the L1 signer
  //  * @param id - the Project ID
  //  * @returns a promise that resolves with the requested Project
  //  * @throws {@link index.IMXError}
  //  */
  // public async getProject(ethSigner: EthSigner, id: string) {
  //   // TODO - workflow
  //   return this.immutableX.getProject(ethSigner, id);
  // }

  // /**
  //  * Get Projects owned by the given User
  //  * @param ethSigner - the L1 signer
  //  * @param pageSize - the page size of the result
  //  * @param cursor - the cursor
  //  * @param orderBy - the property to sort by
  //  * @param direction - direction to sort (asc/desc)
  //  * @returns a promise that resolves with the requested Projects
  //  * @throws {@link index.IMXError}
  //  */
  // public async getProjects(
  //   ethSigner: EthSigner,
  //   pageSize?: number,
  //   cursor?: string,
  //   orderBy?: string,
  //   direction?: string,
  // ) {
  //   // TODO - workflow
  //   return this.immutableX.getProjects(
  //     ethSigner,
  //     pageSize,
  //     cursor,
  //     orderBy,
  //     direction,
  //   );
  // }

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

  // /**
  //  * Mint tokens in a batch with fees
  //  * @param ethSigner - the L1 signer
  //  * @param request - the request object to be provided in the API request
  //  * @returns a promise that resolves with the minted tokens
  //  * @throws {@link index.IMXError}
  //  */
  // public mint(ethSigner: EthSigner, request: UnsignedMintRequest) {
  //   // TODO - workflow
  //   return this.immutableX.mint(ethSigner, request);
  // }

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
  public getOrder(request: OrdersApiGetOrderV3Request) {
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
   * @throws {@link index.IMXError}
   */
  public listOrders(request?: OrdersApiListOrdersV3Request) {
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
   * @throws {@link index.IMXError}
   */
  public getTrade(request: TradesApiGetTradeV3Request) {
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
   * @throws {@link index.IMXError}
   */
  public listTrades(request?: TradesApiListTradesV3Request) {
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
   * @throws {@link index.IMXError}
   */
  public getExchange(request: ExchangesApiGetExchangeRequest) {
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
   * @throws {@link index.IMXError}
   */
  public getExchanges(request: ExchangesApiGetExchangesRequest) {
    return this.exchangeApi.getExchanges(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  // /**
  //  * Create a new Transfer request
  //  * @param walletConnection - the pair of Eth/Stark signers
  //  * @param request - the request object to be provided in the API request
  //  * @returns a promise that resolves with the created Exchange Transfer
  //  * @throws {@link index.IMXError}
  //  */
  // public exchangeTransfer(
  //   walletConnection: WalletConnection,
  //   request: UnsignedExchangeTransferRequest,
  // ) {
  //   // TODO - workflow
  //   return this.immutableX.exchangeTransfer(walletConnection, request);
  // }

  /**
   * Create a new nft primary transaction
   * @param request - the request object to be provided in the API request
   * @returns a promise that resolves with the created nft primary Transaction
   * @throws {@link index.IMXError}
   */
  public createNftPrimary(
    request: NftCheckoutPrimaryApiCreateNftPrimaryRequest,
  ) {
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
   * @throws {@link index.IMXError}
   */
  public getCurrenciesNFTCheckoutPrimary(
    request: NftCheckoutPrimaryApiGetCurrenciesNFTCheckoutPrimaryRequest,
  ) {
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
   * @throws {@link index.IMXError}
   */
  public getNftPrimaryTransaction(
    request: NftCheckoutPrimaryApiGetNftPrimaryTransactionRequest,
  ) {
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
   * @throws {@link index.IMXError}
   */
  public getNftPrimaryTransactions(
    request: NftCheckoutPrimaryApiGetNftPrimaryTransactionsRequest,
  ) {
    return this.nftCheckoutPrimaryApi
      .getNftPrimaryTransactions(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  // /**
  //  * Create a PrimarySale
  //  * @param walletConnection - the pair of L1/L2 signers
  //  * @param request - the request object to be provided in the API request
  //  * @returns a promise that resolves with the created Trade
  //  * @throws {@link index.IMXError}
  //  */
  // public createPrimarySale(
  //   walletConnection: WalletConnection,
  //   request: PrimarySalesApiSignableCreatePrimarySaleRequest,
  // ) {
  //   return this.workflows
  //     .createPrimarySale(walletConnection, request)
  //     .catch(err => {
  //       throw formatError(err);
  //     });
  // }

  // /**
  //  * Accept a PrimarySale
  //  * @param ethSigner - eth signer matching the 'studio_ether_key' of the primary sale
  //  * @param primarySaleId - id of the primary sale accepting
  //  * @returns a promise that resolves with the created Trade
  //  * @throws {@link index.IMXError}
  //  */
  // public acceptPrimarySale(ethSigner: EthSigner, primarySaleId: number) {
  //   return this.workflows
  //     .acceptPrimarySale(ethSigner, primarySaleId)
  //     .catch(err => {
  //       throw formatError(err);
  //     });
  // }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ImmutableX = IMXClient;

// methods moved to x-provider
/**
 * getAddress
 * registerOffchain
 * isRegisteredOffchain
 * isRegisteredOnchain
 * createOrder
 * cancelOrder
 * createTrade
 * transfer
 * batchNftTransfer
 * exchangeTransfer
 * deposit
 * prepareWithdrawal
 * completeWithdrawal
 */

// methods moved from Core SDK that aren't in x-provider
// workflows
/**
 * createCollection
 * updateCollection
 * addMetadataSchemaToCollection
 * updateMetadataSchemaByName
 * listMetadataRefreshes
 * getMetadataRefreshErrors
 * getMetadataRefreshResults
 * createMetadataRefresh
 * getProject
 * getProjects
 * mint
 * exchangeTransfer
 * createPrimarySale
 * acceptPrimarySale
 */
