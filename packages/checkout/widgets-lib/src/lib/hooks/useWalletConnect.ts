import { useCallback, useEffect, useState } from 'react';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { WalletConnectModal } from '@walletconnect/modal';
import { ProviderInfo } from '@walletconnect/ethereum-provider/dist/types/types';
import { WalletConnectManager } from '../walletConnect';

export interface UseWalletConnectParams {
  connectCallback: (data: ProviderInfo) => void,
}

export const useWalletConnect = ({ connectCallback }: UseWalletConnectParams) => {
  const [walletConnectBusy, setWalletConnectBusy] = useState<boolean>(false);
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
      setWalletConnectBusy(true);

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
          .then((result) => {
            setWalletConnectBusy(false);
            resolve(result);
          })
          .catch((error) => {
            // Error opening WalletConnect Modal
            setWalletConnectBusy(true);
            reject(error);
          });
      });

      ethereumProvider?.once('connect', (data) => {
        walletConnectModal?.closeModal();

        if (connectCallback) {
          connectCallback(data);
        }
      });

      ethereumProvider?.connect();
    })
  ), [ethereumProvider, walletConnectModal]);

  return {
    ethereumProvider,
    walletConnectBusy,
    walletConnectModal,
    openWalletConnectModal,
  };
};
