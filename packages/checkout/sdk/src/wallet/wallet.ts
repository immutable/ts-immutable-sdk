import {
  GetWalletAllowListParams,
  GetWalletAllowListResult,
  WalletProviderName,
} from '../types';

export async function getWalletAllowList(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  params: GetWalletAllowListParams,
): Promise<GetWalletAllowListResult> {
  return {
    wallets: [
      {
        walletProvider: WalletProviderName.METAMASK,
        name: WalletProviderName.METAMASK,
      },
    ],
  };
}
