/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-len */
import { imx } from '@imtbl/generated-clients';

export type { TransactionResponse } from 'ethers';

/**
 * Need to specifically export the classes and interfaces from the generated
 * clients imx object for rollup to bundle them correctly.
 */

export class AssetsApi extends imx.AssetsApi {}
export class BalancesApi extends imx.BalancesApi {}
export class CollectionsApi extends imx.CollectionsApi {}
export class DepositsApi extends imx.DepositsApi {}
export class EncodingApi extends imx.EncodingApi {}
export class ExchangesApi extends imx.ExchangesApi {}
export class MintsApi extends imx.MintsApi {}
export class MetadataApi extends imx.MetadataApi {}
export class MetadataRefreshesApi extends imx.MetadataRefreshesApi {}
export class NftCheckoutPrimaryApi extends imx.NftCheckoutPrimaryApi {}
export class OrdersApi extends imx.OrdersApi {}
export class ProjectsApi extends imx.ProjectsApi {}
export class TokensApi extends imx.TokensApi {}
export class TradesApi extends imx.TradesApi {}
export class TransfersApi extends imx.TransfersApi {}
export class UsersApi extends imx.UsersApi {}
export class WithdrawalsApi extends imx.WithdrawalsApi {}

export interface AddMetadataSchemaToCollectionRequest extends imx.AddMetadataSchemaToCollectionRequest {}
export interface APIError extends imx.APIError {}
export interface Asset extends imx.Asset {}
export interface AssetsApiGetAssetRequest extends imx.AssetsApiGetAssetRequest {}
export interface AssetsApiListAssetsRequest extends imx.AssetsApiListAssetsRequest {}
export interface Balance extends imx.Balance {}
export interface BalancesApiGetBalanceRequest extends imx.BalancesApiGetBalanceRequest {}
export interface BalancesApiListBalancesRequest extends imx.BalancesApiListBalancesRequest {}
export interface CancelOrderResponse extends imx.CancelOrderResponse {}
export interface Collection extends imx.Collection {}
export interface CollectionFilter extends imx.CollectionFilter {}
export interface CollectionsApiGetCollectionRequest extends imx.CollectionsApiGetCollectionRequest {}
export interface CollectionsApiListCollectionFiltersRequest extends imx.CollectionsApiListCollectionFiltersRequest {}
export interface CollectionsApiListCollectionsRequest extends imx.CollectionsApiListCollectionsRequest {}
export interface CreateCollectionRequest extends imx.CreateCollectionRequest {}
export interface CreateMetadataRefreshRequest extends imx.CreateMetadataRefreshRequest {}
export interface CreateMetadataRefreshResponse extends imx.CreateMetadataRefreshResponse {}
export interface CreateOrderResponse extends imx.CreateOrderResponse {}
export interface CreateTradeResponse extends imx.CreateTradeResponse {}
export interface CreateTransferResponseV1 extends imx.CreateTransferResponseV1 {}
export interface CreateWithdrawalResponse extends imx.CreateWithdrawalResponse {}
export interface CurrencyWithLimits extends imx.CurrencyWithLimits {}
export interface Deposit extends imx.Deposit {}
export interface DepositsApiGetDepositRequest extends imx.DepositsApiGetDepositRequest {}
export interface DepositsApiListDepositsRequest extends imx.DepositsApiListDepositsRequest {}
export interface Exchange extends imx.Exchange {}
export interface ExchangeCreateExchangeAndURLResponse extends imx.ExchangeCreateExchangeAndURLResponse {}
export interface ExchangesApiCreateExchangeRequest extends imx.ExchangesApiCreateExchangeRequest {}
export interface ExchangesApiGetExchangeRequest extends imx.ExchangesApiGetExchangeRequest {}
export interface ExchangesApiGetExchangesRequest extends imx.ExchangesApiGetExchangesRequest {}
export interface GetMetadataRefreshes extends imx.GetMetadataRefreshes {}
export interface GetMetadataRefreshErrorsResponse extends imx.GetMetadataRefreshErrorsResponse {}
export interface GetMetadataRefreshResponse extends imx.GetMetadataRefreshResponse {}
export interface GetSignableCancelOrderRequest extends imx.GetSignableCancelOrderRequest {}
export interface GetSignableOrderRequest extends imx.GetSignableOrderRequest {}
export interface GetSignableTradeRequest extends imx.GetSignableTradeRequest {}
export interface GetTransactionsResponse extends imx.GetTransactionsResponse {}
export interface GetUsersApiResponse extends imx.GetUsersApiResponse {}
export interface ListAssetsResponse extends imx.ListAssetsResponse {}
export interface ListBalancesResponse extends imx.ListBalancesResponse {}
export interface ListCollectionsResponse extends imx.ListCollectionsResponse {}
export interface ListDepositsResponse extends imx.ListDepositsResponse {}
export interface ListMintsResponse extends imx.ListMintsResponse {}
export interface ListOrdersResponseV3 extends imx.ListOrdersResponseV3 {}
export interface ListTokensResponse extends imx.ListTokensResponse {}
export interface ListTradesResponse extends imx.ListTradesResponse {}
export interface ListTransfersResponse extends imx.ListTransfersResponse {}
export interface ListWithdrawalsResponse extends imx.ListWithdrawalsResponse {}
export interface MetadataApiGetMetadataSchemaRequest extends imx.MetadataApiGetMetadataSchemaRequest {}
export interface MetadataSchemaProperty extends imx.MetadataSchemaProperty {}
export interface MetadataSchemaRequest extends imx.MetadataSchemaRequest {}
export interface Mint extends imx.Mint {}
export interface MintFee extends imx.MintFee {}
export interface MintRequest extends imx.MintRequest {}
export interface MintResultDetails extends imx.MintResultDetails {}
export interface MintsApiGetMintRequest extends imx.MintsApiGetMintRequest {}
export interface MintsApiListMintsRequest extends imx.MintsApiListMintsRequest {}
export interface MintsApiMintTokensRequest extends imx.MintsApiMintTokensRequest {}
export interface MintTokenDataV2 extends imx.MintTokenDataV2 {}
export interface MintTokensResponse extends imx.MintTokensResponse {}
export interface MintUser extends imx.MintUser {}
export interface NftCheckoutPrimaryApiCreateNftPrimaryRequest extends imx.NftCheckoutPrimaryApiCreateNftPrimaryRequest {}
export interface NftCheckoutPrimaryApiGetCurrenciesNFTCheckoutPrimaryRequest extends imx.NftCheckoutPrimaryApiGetCurrenciesNFTCheckoutPrimaryRequest {}
export interface NftCheckoutPrimaryApiGetNftPrimaryTransactionRequest extends imx.NftCheckoutPrimaryApiGetNftPrimaryTransactionRequest {}
export interface NftCheckoutPrimaryApiGetNftPrimaryTransactionsRequest extends imx.NftCheckoutPrimaryApiGetNftPrimaryTransactionsRequest {}
export interface NftprimarytransactionCreateResponse extends imx.NftprimarytransactionCreateResponse {}
export interface NftprimarytransactionGetResponse extends imx.NftprimarytransactionGetResponse {}
export interface NftprimarytransactionListTransactionsResponse extends imx.NftprimarytransactionListTransactionsResponse {}
export interface OrdersApiCreateOrderV3Request extends imx.OrdersApiCreateOrderV3Request {}
export interface OrdersApiGetOrderV3Request extends imx.OrdersApiGetOrderV3Request {}
export interface OrdersApiListOrdersV3Request extends imx.OrdersApiListOrdersV3Request {}
export interface OrderV3 extends imx.OrderV3 {}
export interface Project extends imx.Project {}
export interface SignableToken extends imx.SignableToken {}
export interface SuccessResponse extends imx.SuccessResponse {}
export interface TokenDetails extends imx.TokenDetails {}
export interface TokensApiGetTokenRequest extends imx.TokensApiGetTokenRequest {}
export interface TokensApiListTokensRequest extends imx.TokensApiListTokensRequest {}
export interface Trade extends imx.Trade {}
export interface TradesApiGetTradeV3Request extends imx.TradesApiGetTradeV3Request {}
export interface TradesApiListTradesV3Request extends imx.TradesApiListTradesV3Request {}
export interface Transfer extends imx.Transfer {}
export interface TransfersApiGetTransferRequest extends imx.TransfersApiGetTransferRequest {}
export interface TransfersApiListTransfersRequest extends imx.TransfersApiListTransfersRequest {}
export interface UpdateCollectionRequest extends imx.UpdateCollectionRequest {}
export interface Withdrawal extends imx.Withdrawal {}
export interface WithdrawalsApiGetWithdrawalRequest extends imx.WithdrawalsApiGetWithdrawalRequest {}
export interface WithdrawalsApiListWithdrawalsRequest extends imx.WithdrawalsApiListWithdrawalsRequest {}

// eslint-disable-next-line prefer-destructuring
export const MetadataSchemaRequestTypeEnum: {
  readonly Enum: 'enum';
  readonly Text: 'text';
  readonly Boolean: 'boolean';
  readonly Continuous: 'continuous';
  readonly Discrete: 'discrete';
} = imx.MetadataSchemaRequestTypeEnum;
