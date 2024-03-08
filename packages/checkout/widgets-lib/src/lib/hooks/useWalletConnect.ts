import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { WalletConnectModal } from '@walletconnect/modal';
import { WalletConnectManager } from '../walletConnect';

export interface OpenWalletConnectModalParams {
  connectCallback: (ethereumProvider: EthereumProvider) => void
  restoreSession?: boolean
}

export const useWalletConnect = () => {
  const [walletConnectBusy, setWalletConnectBusy] = useState<boolean>(false);
  const [ethereumProvider, setEthereumProvider] = useState<EthereumProvider | null>(null);
  const [walletConnectModal, setWalletConnectModal] = useState<WalletConnectModal | null>(null);
  const displayUri = useRef<string>('');
  const isWalletConnectEnabled = WalletConnectManager.getInstance().isEnabled;

  useEffect(() => {
    if (isWalletConnectEnabled) {
      (async () => setEthereumProvider(await WalletConnectManager.getInstance().getProvider()))();
      setWalletConnectModal(WalletConnectManager.getInstance().getModal());
    }
  }, [isWalletConnectEnabled]);

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
          if (existingPairings && existingPairings.length > 0 && existingPairings[0].topic !== '') {
            ethereumProvider?.signer.client.core.pairing.activate({ topic: existingPairings[0].topic })
              .then(() => {
                if (connectCallback && ethereumProvider.connected && ethereumProvider.session) {
                  connectCallback(ethereumProvider);
                  displayUri.current = '';
                  resolve({}); // required to resolve when restore is successful
                } else {
                  // eslint-disable-next-line no-console
                  console.log('activate succeeded but there is no connected session');

                  if (displayUri.current !== '') {
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
                  } else {
                    // if we don't have a display uri and no connected session
                    // call connect to generate display_uri event
                    ethereumProvider?.connect();
                  }
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

      ethereumProvider?.once('connect', () => {
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

  const getWalletLogoUrl = useCallback(async () => await WalletConnectManager.getInstance().getWalletLogoUrl(), []);

  return {
    isWalletConnectEnabled,
    ethereumProvider,
    walletConnectBusy,
    walletConnectModal,
    openWalletConnectModal,
    getWalletLogoUrl,
  };
};
