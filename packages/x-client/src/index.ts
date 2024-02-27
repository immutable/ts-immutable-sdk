export {
  ImxModuleConfiguration,
  ImxModuleConfiguration as ImxClientModuleConfiguration, // preserve old name for backwards compatibility
} from './config';
export { IMXClient, ImmutableX } from './IMXClient';
export {
  createStarkSigner,
  createStarkSigner as imxClientCreateStarkSigner, // preserve old name for backwards compatibility
  generateLegacyStarkPrivateKey,
  generateLegacyStarkPrivateKey as imxClientGenerateLegacyStarkPrivateKey, // TODO - remove console.log in utils file -- // preserve old name for backwards compatibility
  generateStarkPrivateKey,
} from './utils';
export { IMXError } from './types/errors';
export * from './types/requests';
export {
  EthSigner,
  StarkSigner,
  WalletConnection,
  WalletConnection as ImxClientWalletConnection, // preserve old name for backwards compatibility
} from './types/signers';
export * from './types/tokens';
export * from './types/transfers';
// export types for IMXClient
export {
  AddMetadataSchemaToCollectionRequest,
  AssetsApi,
  AssetsApiGetAssetRequest,
  AssetsApiListAssetsRequest,
  BalancesApi,
  BalancesApiGetBalanceRequest,
  BalancesApiListBalancesRequest,
  CollectionsApi,
  CollectionsApiGetCollectionRequest,
  CollectionsApiListCollectionFiltersRequest,
  CollectionsApiListCollectionsRequest,
  CreateCollectionRequest,
  CreateMetadataRefreshRequest,
  DepositsApi,
  DepositsApiGetDepositRequest,
  DepositsApiListDepositsRequest,
  EncodingApi,
  ExchangesApi,
  ExchangesApiCreateExchangeRequest,
  ExchangesApiGetExchangeRequest,
  ExchangesApiGetExchangesRequest,
  MintsApi,
  MintsApiGetMintRequest,
  MintsApiListMintsRequest,
  MetadataApi,
  MetadataApiGetMetadataSchemaRequest,
  MetadataRefreshesApi,
  MetadataSchemaRequest,
  NftCheckoutPrimaryApi,
  NftCheckoutPrimaryApiCreateNftPrimaryRequest,
  NftCheckoutPrimaryApiGetCurrenciesNFTCheckoutPrimaryRequest,
  NftCheckoutPrimaryApiGetNftPrimaryTransactionRequest,
  NftCheckoutPrimaryApiGetNftPrimaryTransactionsRequest,
  OrdersApi,
  OrdersApiGetOrderV3Request,
  OrdersApiListOrdersV3Request,
  PrimarySalesApi,
  PrimarySalesApiSignableCreatePrimarySaleRequest,
  ProjectsApi,
  TokensApi,
  TokensApiGetTokenRequest,
  TokensApiListTokensRequest,
  TradesApi,
  TradesApiGetTradeV3Request,
  TradesApiListTradesV3Request,
  TransfersApi,
  TransfersApiGetTransferRequest,
  TransfersApiListTransfersRequest,
  UpdateCollectionRequest,
  UsersApi,
  WithdrawalsApi,
  WithdrawalsApiGetWithdrawalRequest,
  WithdrawalsApiListWithdrawalsRequest,
} from './types';
