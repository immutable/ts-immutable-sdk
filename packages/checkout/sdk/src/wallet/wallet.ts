import {
  GetWalletAllowListParams,
  GetWalletAllowListResult,
  WalletInfo,
  WalletProviderName,
} from '../types';

export async function getWalletAllowList(
  params: GetWalletAllowListParams,
): Promise<GetWalletAllowListResult> {
  const walletList: WalletInfo[] = [];
  const excludedWalletProvider = params.exclude?.map((wp) => wp.walletProviderName) ?? [];

  let walletProviderNames = Object.values(WalletProviderName);
  if (excludedWalletProvider.length !== 0) {
    walletProviderNames = walletProviderNames.filter((wp) => !excludedWalletProvider.includes(wp));
  }

  for (const value of walletProviderNames) {
    walletList.push({
      walletProviderName: value,
      name: value,
    });
  }

  return {
    wallets: walletList,
  };
}
