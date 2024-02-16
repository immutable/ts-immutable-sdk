import { useCallback, useEffect, useState } from 'react';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { WalletConnectModal } from '@walletconnect/modal';
import { WalletConnectManager } from '../walletConnect';

export const useWalletConnect = () => {
  const [ethereumProvider, setEthereumProvider] = useState<EthereumProvider | null>(null);
  const [walletConnectModal, setWalletConnectModal] = useState<WalletConnectModal | null>(null);
  // const [displayUri, setDisplayUri] = useState<string | null>(null);

  useEffect(() => {
    (async () => setEthereumProvider(await WalletConnectManager.getInstance().getProvider()))();
    setWalletConnectModal(WalletConnectManager.getInstance().getModal());
  }, []);

  const openWalletConnectModal = useCallback(async () => (
    new Promise((resolve, reject) => {
      if (!ethereumProvider || !walletConnectModal) reject('WalletConnect not initialized');

      // Hook into next available display_uri
      ethereumProvider?.once('display_uri', (data) => {
        // eslint-disable-next-line no-console
        console.log('** hook wc display_uri', data);
        const pairingTopic = data.split('@')[0].replace('wc:', '');
        // eslint-disable-next-line no-console
        console.log('** hook pairingTopic', pairingTopic);

        // setDisplayUri(data);
        walletConnectModal?.openModal({
          uri: data,
        })
          .then(resolve)
          .catch(reject);
      });

      ethereumProvider?.connect();
    })
  ), [ethereumProvider, walletConnectModal]);

  return {
    ethereumProvider,
    walletConnectModal,
    openWalletConnectModal,
  };
};
