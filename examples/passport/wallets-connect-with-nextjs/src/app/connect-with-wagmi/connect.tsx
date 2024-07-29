import { useAccount } from 'wagmi';
import { WalletOptions } from './wallet-options';
import { Account } from './account';

// show wallet options for login or the logged in account details
// depending on whether the account is connected or not
export function ConnectWallet() {
  const { isConnected } = useAccount();
  if (isConnected) return <Account />;
  return <WalletOptions />;
}
