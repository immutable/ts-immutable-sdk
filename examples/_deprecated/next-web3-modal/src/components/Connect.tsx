import { passportInstance } from '@/app/passport';
import { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';

export function Connect() {
  const { isConnected, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const [disconnectTxt, setDisconnectTxt] = useState('Disconnect');

  // @ts-ignore
  if (!isConnected || isConnecting) return <w3m-connect-button />;

  return (
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
  );
}
