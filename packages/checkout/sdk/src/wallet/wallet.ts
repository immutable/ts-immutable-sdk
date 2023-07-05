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
        description:
          'MetaMask is a browser extension that allows you to manage your Ethereum accounts and private keys.',
        icon: '',
      },
    ],
  };
}
