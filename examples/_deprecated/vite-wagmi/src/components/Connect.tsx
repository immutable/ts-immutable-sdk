import { useAccount } from 'wagmi';

import { Account } from './Account';
import { ConnectorsList } from './ConnectorsList';

export function Connect() {
  const { isConnected } = useAccount();
  return <div className="container">{isConnected ? <Account /> : <ConnectorsList />}</div>;
}
