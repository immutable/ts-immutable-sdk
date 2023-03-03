import { ImmutableX } from '@imtbl/core-sdk';
import {
  AssetsApiGetAssetRequest,
  AssetsApiListAssetsRequest,
  BalancesApiGetBalanceRequest,
  BalancesApiListBalancesRequest,
  CollectionsApiGetCollectionRequest,
  CollectionsApiListCollectionFiltersRequest,
  CollectionsApiListCollectionsRequest,
  DepositsApiGetDepositRequest,
  DepositsApiListDepositsRequest,
  MintsApiGetMintRequest,
  MintsApiListMintsRequest,
  OrdersApiGetOrderRequest,
  OrdersApiListOrdersRequest,
  TokensApiGetTokenRequest,
  TokensApiListTokensRequest,
  TradesApiGetTradeRequest,
  TradesApiListTradesRequest,
  TransfersApiGetTransferRequest,
  TransfersApiListTransfersRequest,
  WithdrawalsApiGetWithdrawalRequest,
  WithdrawalsApiListWithdrawalsRequest,
} from '@imtbl/core-sdk';
import { Configuration } from 'config';

export class StarkExClient {
  private client: ImmutableX;

  constructor(config: Configuration) {
    this.client = new ImmutableX(config.getStarkExConfig());
  }

  /**
   * Get details of a Deposit with the given ID
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Deposit
   * @throws {@link index.IMXError}
   */
  public getDeposit(request: DepositsApiGetDepositRequest) {
    return this.client.getDeposit(request);
  }

  /**
   * Get a list of Deposits
   * @param request - optional request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Deposits
   * @throws {@link index.IMXError}
   */
  public listDeposits(request?: DepositsApiListDepositsRequest) {
    return this.client.listDeposits(request);
  }

  /**
   * Get Stark keys for a registered User
   * @param ethAddress - the eth address of the User
   * @returns a promise that resolves with the requested User
   * @throws {@link index.IMXError}
   */
  public getUser(ethAddress: string) {
    return this.client.getUser(ethAddress);
  }

  /**
   * Get details of an Asset
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Asset
   * @throws {@link index.IMXError}
   */
  public getAsset(request: AssetsApiGetAssetRequest) {
    return this.client.getAsset(request);
  }

  /**
   * Get a list of Assets
   * @param request - optional request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Assets
   * @throws {@link index.IMXError}
   */
  public listAssets(request?: AssetsApiListAssetsRequest) {
    return this.client.listAssets(request);
  }

  /**
   * Get details of a Collection at the given address
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Collection
   * @throws {@link index.IMXError}
   */
  public getCollection(request: CollectionsApiGetCollectionRequest) {
    return this.client.getCollection(request);
  }

  /**
   * Get a list of Collection filters
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Collection Filters
   * @throws {@link index.IMXError}
   */
  public listCollectionFilters(
    request: CollectionsApiListCollectionFiltersRequest
  ) {
    return this.client.listCollectionFilters(request);
  }

  /**
   * Get a list of Collections
   * @param request - optional request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Collections
   * @throws {@link index.IMXError}
   */
  public listCollections(request?: CollectionsApiListCollectionsRequest) {
    return this.client.listCollections(request);
  }

  /**
   * Get the token Balances of the User
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Balance
   * @throws {@link index.IMXError}
   */
  public getBalance(request: BalancesApiGetBalanceRequest) {
    return this.client.getBalance(request);
  }

  /**
   * Get a list of Balances for given User
   * @param request the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Balances
   * @throws {@link index.IMXError}
   */
  public listBalances(request: BalancesApiListBalancesRequest) {
    return this.client.listBalances(request);
  }

  /**
   * Get details of a Mint with the given ID
   * @param request the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Mint
   * @throws {@link index.IMXError}
   */
  public getMint(request: MintsApiGetMintRequest) {
    return this.client.getMint(request);
  }

  /**
   * Get a list of Mints
   * @param request optional request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Mints
   * @throws {@link index.IMXError}
   */
  public listMints(request?: MintsApiListMintsRequest) {
    return this.client.listMints(request);
  }

  /**
   * Get a list of Withdrawals
   * @param request - optional request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Withdrawals
   * @throws {@link index.IMXError}
   */
  public listWithdrawals(request?: WithdrawalsApiListWithdrawalsRequest) {
    return this.client.listWithdrawals(request);
  }

  /**
   * Get details of Withdrawal with the given ID
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Withdrawal
   * @throws {@link index.IMXError}
   */
  public getWithdrawal(request: WithdrawalsApiGetWithdrawalRequest) {
    return this.client.getWithdrawal(request);
  }

  /**
   * Get details of an Order with the given ID
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Order
   * @throws {@link index.IMXError}
   */
  public getOrder(request: OrdersApiGetOrderRequest) {
    return this.client.getOrder(request);
  }

  /**
   * Get a list of Orders
   * @param request - optional request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Orders
   * @throws {@link index.IMXError}
   */
  public listOrders(request?: OrdersApiListOrdersRequest) {
    return this.client.listOrders(request);
  }

  /**
   * Get details of a Trade with the given ID
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Trade
   * @throws {@link index.IMXError}
   */
  public getTrade(request: TradesApiGetTradeRequest) {
    return this.client.getTrade(request);
  }

  /**
   * Get a list of Trades
   * @param request - optional request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Trades
   * @throws {@link index.IMXError}
   */
  public listTrades(request?: TradesApiListTradesRequest) {
    return this.client.listTrades(request);
  }

  /**
   * Get details of a Token
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Token
   * @throws {@link index.IMXError}
   */
  public getToken(request: TokensApiGetTokenRequest) {
    return this.client.getToken(request);
  }

  /**
   * Get a list of Tokens
   * @param request - optional request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Tokens
   * @throws {@link index.IMXError}
   */
  public listTokens(request?: TokensApiListTokensRequest) {
    return this.client.listTokens(request);
  }

  /**
   * Get details of a Transfer with the given ID
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested Transfer
   * @throws {@link index.IMXError}
   */
  public getTransfer(request: TransfersApiGetTransferRequest) {
    return this.client.getTransfer(request);
  }

  /**
   * Get a list of Transfers
   * @param request - optional request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the requested list of Transfers
   * @throws {@link index.IMXError}
   */
  public listTransfers(request?: TransfersApiListTransfersRequest) {
    return this.client.listTransfers(request);
  }
}

// export types
export {
  AssetsApiGetAssetRequest,
  AssetsApiListAssetsRequest,
  BalancesApiGetBalanceRequest,
  BalancesApiListBalancesRequest,
  CollectionsApiGetCollectionRequest,
  CollectionsApiListCollectionFiltersRequest,
  CollectionsApiListCollectionsRequest,
  DepositsApiGetDepositRequest,
  DepositsApiListDepositsRequest,
  MintsApiGetMintRequest,
  MintsApiListMintsRequest,
  OrdersApiGetOrderRequest,
  OrdersApiListOrdersRequest,
  TokensApiGetTokenRequest,
  TokensApiListTokensRequest,
  TradesApiGetTradeRequest,
  TradesApiListTradesRequest,
  TransfersApiGetTransferRequest,
  TransfersApiListTransfersRequest,
  WithdrawalsApiGetWithdrawalRequest,
  WithdrawalsApiListWithdrawalsRequest,
};
