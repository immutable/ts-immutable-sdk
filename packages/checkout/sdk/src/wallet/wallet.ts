import {
  ConnectionProviders,
  GetWalletAllowListParams,
  GetWalletAllowListResult,
  WalletFilterTypes,
  WalletInfo,
} from '../types';
import masterWalletList from './wallet_master_list.json';

export async function getWalletAllowList({
  type = WalletFilterTypes.ALL,
  exclude,
}: GetWalletAllowListParams): Promise<GetWalletAllowListResult> {
  // todo:For async API call, use the CheckoutError with errorType:API_CALL_ERROR?? or any other

  const filteredWalletsList = masterWalletList
    .filter((wallet) => {
      const walletNotExcluded = !exclude
        ?.map((excludeWallet) => excludeWallet.connectionProvider)
        .includes(wallet.connectionProvider as ConnectionProviders);

      const allowAllWallets = type === WalletFilterTypes.ALL;
      const walletsAllowedForType = wallet.platform.includes(type);

      return walletNotExcluded && (allowAllWallets || walletsAllowedForType);
    })
    .map((wallet) => {
      const { platform, ...walletInfo } = wallet;
      return walletInfo as WalletInfo;
    });

  return {
    allowedWallets: filteredWalletsList,
  };
}
