import { Web3Provider } from '@ethersproject/providers';
import { isMetaMaskProvider, isPassportProvider } from '../providerUtils';

/**
 * identifyUser - function to identify a user by their wallet address and call the function to raise analytics
 * @param identify - The identify function from the useAnalytics() hook
 * @param provider - the Web3Provider used to find the user's walletAddress
 */
export async function identifyUser(
  identify: (id: string, attributes: Record<string, any>) => void,
  provider: Web3Provider,
) {
  // WT-1698 Analytics - Identify user here then progress to widget
  const walletAddress = (await provider.getSigner().getAddress()).toLowerCase();
  const isMetaMask = isMetaMaskProvider(provider);
  const isPassport = isPassportProvider(provider);
  identify(walletAddress, {
    isMetaMask,
    isPassportWallet: isPassport,
  });
}
