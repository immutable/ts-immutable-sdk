/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-len */
import { imx } from '@imtbl/generated-clients';

export { type TransactionResponse } from '@ethersproject/providers';

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
export class PrimarySalesApi extends imx.PrimarySalesApi {}
export class ProjectsApi extends imx.ProjectsApi {}
export class TokensApi extends imx.TokensApi {}
export class TradesApi extends imx.TradesApi {}
export class TransfersApi extends imx.TransfersApi {}
export class UsersApi extends imx.UsersApi {}
export class WithdrawalsApi extends imx.WithdrawalsApi {}

export interface APIError extends imx.APIError {}
export interface AcceptPrimarySaleBadRequestBody extends imx.AcceptPrimarySaleBadRequestBody {}
export interface AcceptPrimarySaleForbiddenBody extends imx.AcceptPrimarySaleForbiddenBody {}
export interface AcceptPrimarySaleNotFoundBody extends imx.AcceptPrimarySaleNotFoundBody {}
export interface AcceptPrimarySaleOKBody extends imx.AcceptPrimarySaleOKBody {}
export interface AcceptPrimarySaleUnauthorizedBody extends imx.AcceptPrimarySaleUnauthorizedBody {}
export interface AddMetadataSchemaToCollectionRequest extends imx.AddMetadataSchemaToCollectionRequest {}
export interface AssetsApiGetAssetRequest extends imx.AssetsApiGetAssetRequest {}
export interface AssetsApiListAssetsRequest extends imx.AssetsApiListAssetsRequest {}
export interface Balance extends imx.Balance {}
export interface BalancesApiGetBalanceRequest extends imx.BalancesApiGetBalanceRequest {}
export interface BalancesApiListBalancesRequest extends imx.BalancesApiListBalancesRequest {}
export interface CancelOrderResponse extends imx.CancelOrderResponse {}
export interface CollectionsApiGetCollectionRequest extends imx.CollectionsApiGetCollectionRequest {}
export interface CollectionsApiListCollectionFiltersRequest extends imx.CollectionsApiListCollectionFiltersRequest {}
export interface CollectionsApiListCollectionsRequest extends imx.CollectionsApiListCollectionsRequest {}
export interface CreateCollectionRequest extends imx.CreateCollectionRequest {}
export interface CreateMetadataRefreshRequest extends imx.CreateMetadataRefreshRequest {}
export interface CreateOrderResponse extends imx.CreateOrderResponse {}
export interface CreatePrimarySaleBadRequestBody extends imx.CreatePrimarySaleBadRequestBody {}
export interface CreatePrimarySaleCreatedBody extends imx.CreatePrimarySaleCreatedBody {}
export interface CreatePrimarySaleForbiddenBody extends imx.CreatePrimarySaleForbiddenBody {}
export interface CreatePrimarySaleNotFoundBody extends imx.CreatePrimarySaleNotFoundBody {}
export interface CreatePrimarySaleUnauthorizedBody extends imx.CreatePrimarySaleUnauthorizedBody {}
export interface CreateTradeResponse extends imx.CreateTradeResponse {}
export interface CreateTransferResponseV1 extends imx.CreateTransferResponseV1 {}
export interface CreateWithdrawalResponse extends imx.CreateWithdrawalResponse {}
export interface DepositsApiGetDepositRequest extends imx.DepositsApiGetDepositRequest {}
export interface DepositsApiListDepositsRequest extends imx.DepositsApiListDepositsRequest {}
export interface ExchangesApiCreateExchangeRequest extends imx.ExchangesApiCreateExchangeRequest {}
export interface ExchangesApiGetExchangeRequest extends imx.ExchangesApiGetExchangeRequest {}
export interface ExchangesApiGetExchangesRequest extends imx.ExchangesApiGetExchangesRequest {}
export interface GetSignableCancelOrderRequest extends imx.GetSignableCancelOrderRequest {}
export interface GetSignableOrderRequest extends imx.GetSignableOrderRequest {}
export interface GetSignableTradeRequest extends imx.GetSignableTradeRequest {}
export interface MetadataApiGetMetadataSchemaRequest extends imx.MetadataApiGetMetadataSchemaRequest {}
export interface MetadataSchemaRequest extends imx.MetadataSchemaRequest {}
export interface MintFee extends imx.MintFee {}
export interface MintResultDetails extends imx.MintResultDetails {}
export interface MintRequest extends imx.MintRequest {}
export interface MintTokenDataV2 extends imx.MintTokenDataV2 {}
export interface MintTokensResponse extends imx.MintTokensResponse {}
export interface MintUser extends imx.MintUser {}
export interface MintsApiGetMintRequest extends imx.MintsApiGetMintRequest {}
export interface MintsApiListMintsRequest extends imx.MintsApiListMintsRequest {}
export interface MintsApiMintTokensRequest extends imx.MintsApiMintTokensRequest {}
export interface NftCheckoutPrimaryApiCreateNftPrimaryRequest extends imx.NftCheckoutPrimaryApiCreateNftPrimaryRequest {}
export interface NftCheckoutPrimaryApiGetCurrenciesNFTCheckoutPrimaryRequest extends imx.NftCheckoutPrimaryApiGetCurrenciesNFTCheckoutPrimaryRequest {}
export interface NftCheckoutPrimaryApiGetNftPrimaryTransactionRequest extends imx.NftCheckoutPrimaryApiGetNftPrimaryTransactionRequest {}
export interface NftCheckoutPrimaryApiGetNftPrimaryTransactionsRequest extends imx.NftCheckoutPrimaryApiGetNftPrimaryTransactionsRequest {}
export interface OrdersApiCreateOrderV3Request extends imx.OrdersApiCreateOrderV3Request {}
export interface OrdersApiGetOrderV3Request extends imx.OrdersApiGetOrderV3Request {}
export interface OrdersApiListOrdersV3Request extends imx.OrdersApiListOrdersV3Request {}
export interface PrimarySalesApiCreatePrimarySaleRequest extends imx.PrimarySalesApiCreatePrimarySaleRequest {}
export interface PrimarySalesApiSignableCreatePrimarySaleRequest extends imx.PrimarySalesApiSignableCreatePrimarySaleRequest {}
export interface RejectPrimarySaleBadRequestBody extends imx.RejectPrimarySaleBadRequestBody {}
export interface RejectPrimarySaleForbiddenBody extends imx.RejectPrimarySaleForbiddenBody {}
export interface RejectPrimarySaleNotFoundBody extends imx.RejectPrimarySaleNotFoundBody {}
export interface RejectPrimarySaleOKBody extends imx.RejectPrimarySaleOKBody {}
export interface RejectPrimarySaleUnauthorizedBody extends imx.RejectPrimarySaleUnauthorizedBody {}
export interface SignableToken extends imx.SignableToken {}
export interface TokensApiGetTokenRequest extends imx.TokensApiGetTokenRequest {}
export interface TokensApiListTokensRequest extends imx.TokensApiListTokensRequest {}
export interface TradesApiGetTradeV3Request extends imx.TradesApiGetTradeV3Request {}
export interface TradesApiListTradesV3Request extends imx.TradesApiListTradesV3Request {}
export interface TransfersApiGetTransferRequest extends imx.TransfersApiGetTransferRequest {}
export interface TransfersApiListTransfersRequest extends imx.TransfersApiListTransfersRequest {}
export interface UpdateCollectionRequest extends imx.UpdateCollectionRequest {}
export interface WithdrawalsApiGetWithdrawalRequest extends imx.WithdrawalsApiGetWithdrawalRequest {}
export interface WithdrawalsApiListWithdrawalsRequest extends imx.WithdrawalsApiListWithdrawalsRequest {}

export const { MetadataSchemaRequestTypeEnum } = imx;
