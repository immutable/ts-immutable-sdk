import {
  GetWalletAllowListParams,
  GetWalletAllowListResult,
  WalletProviderName,
} from '../types';

export async function getWalletAllowList(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  params: GetWalletAllowListParams,
): Promise<GetWalletAllowListResult> {
  const walletList = Object.keys(WalletProviderName).map((key) => ({
    walletProvider: WalletProviderName[key as keyof typeof WalletProviderName],
    name: WalletProviderName.METAMASK,
  }));

  return {
    wallets: walletList,
  };
}
