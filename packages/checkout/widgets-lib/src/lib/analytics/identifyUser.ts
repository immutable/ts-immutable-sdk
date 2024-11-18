import { NamedBrowserProvider } from '@imtbl/checkout-sdk';
import { isMetaMaskProvider, isPassportProvider } from '../provider';

/**
 * identifyUser - function to identify a user by their wallet address and call the function to raise analytics
 * @param identify - The identify function from the useAnalytics() hook
 * @param provider - the BrowserProvider used to find the user's walletAddress
 */
export async function identifyUser(
  identify: (id: string, attributes: Record<string, any>) => void,
  provider: NamedBrowserProvider,
) {
  // WT-1698 Analytics - Identify user here then progress to widget
  const walletAddress = (await (await provider.getSigner()).getAddress()).toLowerCase();
  const isMetaMask = isMetaMaskProvider(provider.name);
  const isPassport = isPassportProvider(provider.name);
  try {
    identify(walletAddress, {
      isMetaMask,
      isPassportWallet: isPassport,
    });
  // eslint-disable-next-line no-console
  } catch (error: any) { console.error('analytics: unable to identify user: ', error); }
}
