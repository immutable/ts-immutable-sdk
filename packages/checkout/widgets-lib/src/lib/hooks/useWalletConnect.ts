import { useCallback, useEffect, useState } from 'react';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { WalletConnectModal } from '@walletconnect/modal';
import { WalletConnectManager } from '../walletConnect';
import { Checkout } from '@imtbl/checkout-sdk';

export interface UseWalletConnectParams {
  checkout: Checkout | null;
}

export interface OpenWalletConnectModalParams {
  connectCallback: (ethereumProvider: EthereumProvider) => void
  restoreSession?: boolean
}

export const useWalletConnect = ({ checkout }: UseWalletConnectParams) => {
  const [isWalletConnectEnabled, setIsWalletConnectEnabled] = useState(false);
  const [walletConnectBusy, setWalletConnectBusy] = useState<boolean>(false);
  const [ethereumProvider, setEthereumProvider] = useState<EthereumProvider | null>(null);
  const [walletConnectModal, setWalletConnectModal] = useState<WalletConnectModal | null>(null);
  // const [displayUri, setDisplayUri] = useState<string | null>(null);

  useEffect(() => {
    if(!checkout) return;
    (async () => {
      const connectConfig = await checkout.config.remote.getConfig('connect');
      setIsWalletConnectEnabled(
        /**connectConfig?.walletConnect */ true && 
        WalletConnectManager.getInstance().isInitialised
        );
    })();
  }, [checkout])

  useEffect(() => {
    if (WalletConnectManager.getInstance().isInitialised) {
      (async () => setEthereumProvider(await WalletConnectManager.getInstance().getProvider()))();
      setWalletConnectModal(WalletConnectManager.getInstance().getModal());
    }
  }, []);

  const openWalletConnectModal = useCallback(async ({
    connectCallback,
    restoreSession = true
  }: OpenWalletConnectModalParams) => (
    new Promise((resolve, reject) => {
      if (!ethereumProvider || !walletConnectModal) reject('WalletConnect not initialized');
      setWalletConnectBusy(true);

      if (restoreSession) {
        // restore session
        const existingPairings = ethereumProvider?.signer.client.core.pairing.getPairings();
        // console.log('existingPairings', existingPairings);
        if (existingPairings && existingPairings.length > 0 && existingPairings[0].topic !== '') {
          // console.log('restoring existing pairing for', existingPairings[0])
          ethereumProvider?.signer.client.core.pairing.activate({ topic: existingPairings[0].topic })
            .then(() => {

              // inspect ethereumProvider to see if it is connected with a network
              // if not call ethereumProvider.connect({paritingTopic: existingPairings[0].topic})
              if (connectCallback) {
                connectCallback(ethereumProvider);
              }
            });
          return;
        }
      }

      // Hook into next available display_uri
      ethereumProvider?.once('display_uri', (data) => {
        // eslint-disable-next-line no-console
        console.log('useWalletConnect::display_uri', data);
        const pairingTopic = data.split('@')[0].replace('wc:', '');
        // eslint-disable-next-line no-console
        console.log('useWalletConnect::pairingTopic', pairingTopic);

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
        // eslint-disable-next-line no-console
        console.log('useWalletConnect::data', data);
        walletConnectModal?.closeModal();

        if (connectCallback) {
          connectCallback(ethereumProvider);
        }
      });

      ethereumProvider?.connect();
    })
  ), [ethereumProvider, walletConnectModal]);

  const restoreExistingSession = useCallback(async () => new Promise((resolve) => {
    const existingPairings = ethereumProvider?.signer.client.core.pairing.getPairings();
    if (existingPairings && existingPairings.length > 0) {
      ethereumProvider?.signer.client.core.pairing.activate({ topic: existingPairings[0].topic })
        .then(() => resolve(true));
    } else {
      resolve(false);
    }
  }), [ethereumProvider]);

  return {
    isWalletConnectEnabled,
    ethereumProvider,
    walletConnectBusy,
    walletConnectModal,
    openWalletConnectModal,
    restoreExistingSession,
  };
};
