import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { WalletConnectModal } from '@walletconnect/modal';
import { Checkout } from '@imtbl/checkout-sdk';
import { WalletConnectManager } from '../walletConnect';

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
  const displayUri = useRef<string>('');

  useEffect(() => {
    if (!checkout) return;
    (async () => {
      const connectConfig = await checkout.config.remote.getConfig('connect') as any;
      setIsWalletConnectEnabled(
        connectConfig?.walletConnect
        && WalletConnectManager.getInstance().isInitialised,
      );
    })();
  }, [checkout]);

  useEffect(() => {
    if (WalletConnectManager.getInstance().isInitialised) {
      (async () => setEthereumProvider(await WalletConnectManager.getInstance().getProvider()))();
      setWalletConnectModal(WalletConnectManager.getInstance().getModal());
    }
  }, []);

  const openWalletConnectModal = useCallback(async ({
    connectCallback,
    restoreSession = true,
  }: OpenWalletConnectModalParams) => (
    new Promise((resolve, reject) => {
      if (!ethereumProvider || !walletConnectModal) reject('WalletConnect not initialized');
      setWalletConnectBusy(true);

      if (restoreSession) {
        // try to restore session
        // get pairings
        // if we have an existing pairing with a topic -> activate
        // if then the ethereumProvider is connected and has a session
        // call connectCallback and return
        // if not we need to create a new session

        try {
          const existingPairings = ethereumProvider?.signer.client.core.pairing.getPairings();
          // console.log('existingPairings', existingPairings);
          if (existingPairings && existingPairings.length > 0 && existingPairings[0].topic !== '') {
            // console.log('restoring existing pairing for', existingPairings[0]);
            ethereumProvider?.signer.client.core.pairing.activate({ topic: existingPairings[0].topic })
              .then(() => {
                if (connectCallback && ethereumProvider.connected && ethereumProvider.session) {
                  connectCallback(ethereumProvider);
                  displayUri.current = '';
                  resolve({}); // required to resolve when restore is successful
                } else {
                  // eslint-disable-next-line no-console
                  console.log('activate succeeded but there is no connected session');
                }
              // eslint-disable-next-line no-console
              }).catch((err) => console.log('activate existing pairing error', err));
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err);
        }
      }

      // Hook into next available display_uri
      ethereumProvider?.once('display_uri', (data) => {
        // save the displayUri in case the user closes the modal without connecting
        displayUri.current = data;

        // eslint-disable-next-line no-console
        console.log('useWalletConnect::display_uri', data);
        const pairingTopicFromUrl = data.split('@')[0].replace('wc:', '');
        // eslint-disable-next-line no-console
        console.log('useWalletConnect::pairingTopic', pairingTopicFromUrl);

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
        console.log('useWalletConnect::connect event', data);
        walletConnectModal?.closeModal();
        // reset the display uri once it has been successfully used for connection
        displayUri.current = '';

        if (connectCallback && ethereumProvider.connected) {
          connectCallback(ethereumProvider);
        }
      });

      // if we have a display uri that hasn't been used and no connected session
      // open the modal
      if (displayUri.current !== '' && !ethereumProvider?.session) {
        walletConnectModal?.openModal({
          uri: displayUri.current,
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
      } else if (!ethereumProvider?.session) {
        // if we don't have a display uri and no connected session
        // call connect to generate display_uri event
        ethereumProvider?.connect();
      }
    })
  ), [ethereumProvider, walletConnectModal]);

  return {
    isWalletConnectEnabled,
    ethereumProvider,
    walletConnectBusy,
    walletConnectModal,
    openWalletConnectModal,
  };
};
