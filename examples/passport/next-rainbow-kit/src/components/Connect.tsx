import '@rainbow-me/rainbowkit/styles.css';
import { passportInstance } from '@/app/passport';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState } from 'react';
import { useDisconnect } from 'wagmi';

export function Connect() {
  const { disconnect } = useDisconnect();
  const [disconnectTxt, setDisconnectTxt] = useState('Disconnect');

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        console.log(account);
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected = ready
          && account
          && chain
          && (!authenticationStatus || authenticationStatus === 'authenticated');
        return (
          <div
            aria-hidden={!ready ? 'true' : undefined}
            style={{
              opacity: !ready ? 0 : undefined,
              pointerEvents: !ready ? 'none' : undefined,
              userSelect: !ready ? 'none' : undefined,
            }}
          >
            {(() => {
              if (!connected) {
                return (
                  <button onClick={openConnectModal} type="button">
                    Connect Wallet
                  </button>
                );
              }
              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} type="button">
                    Wrong network
                  </button>
                );
              }
              return (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={openChainModal}
                    style={{ display: 'flex', alignItems: 'center' }}
                    type="button"
                  >
                    {chain.hasIcon && (
                    <div
                      style={{
                        background: chain.iconBackground,
                        width: 12,
                        height: 12,
                        borderRadius: 999,
                        overflow: 'hidden',
                        marginRight: 4,
                      }}
                    >
                      {chain.iconUrl && (
                      <img
                        alt={chain.name ?? 'Chain icon'}
                        src={chain.iconUrl}
                        style={{ width: 12, height: 12 }}
                      />
                      )}
                    </div>
                    )}
                    {chain.name}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setDisconnectTxt('Disconnecting ...');
                      const userinfo = await passportInstance.getUserInfo();
                      if (userinfo) await passportInstance.logout();
                      disconnect();
                    }}
                  >
                    {disconnectTxt}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
