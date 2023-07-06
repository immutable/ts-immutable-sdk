import {
  GetWalletAllowListParams,
  GetWalletAllowListResult,
  WalletInfo,
  WalletProviderName,
} from '../types';

export async function getWalletAllowList(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  params: GetWalletAllowListParams,
): Promise<GetWalletAllowListResult> {
  const walletList: WalletInfo[] = [];

  const walletProviderNames = Object.values(WalletProviderName);
  for (const value of walletProviderNames) {
    walletList.push({
      walletProvider: value,
      name: value,
    });
  }

  return {
    wallets: walletList,
  };
}
