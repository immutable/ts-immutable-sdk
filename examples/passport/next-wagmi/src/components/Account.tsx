import {
  useAccount, useDisconnect, useEnsAvatar, useEnsName,
} from 'wagmi';
import { useState } from 'react';
import { passportInstance } from '@/app/passport';

function formatAddress(address?: string) {
  if (!address) return null;
  return `${address.slice(0, 6)}…${address.slice(38, 42)}`;
}

export function Account() {
  const { address, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! });
  const [disconnectTxt, setDisconnectTxt] = useState('Disconnect');

  const formattedAddress = formatAddress(address);

  return (
    <div className="row">
      <div className="inline">
        {ensAvatar ? (
          <img alt="ENS Avatar" className="avatar" src={ensAvatar} />
        ) : (
          <div className="avatar" />
        )}
        <div className="stack">
          {address && (
            <div className="text">
              {ensName ? `${ensName} (${formattedAddress})` : formattedAddress}
            </div>
          )}
          <div className="subtext">
            Connected to
            {' '}
            {connector?.name}
            {' '}
            Connector
          </div>
        </div>
      </div>
      <div>
        <button
          className="button"
          onClick={async () => {
            setDisconnectTxt('Disconnecting ...');
            const userinfo = await passportInstance.getUserInfo();
            if (userinfo) await passportInstance.logout();
            disconnect();
          }}
          type="button"
        >
          {disconnectTxt}
        </button>
      </div>
    </div>
  );
}
