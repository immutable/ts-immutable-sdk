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
  }: OpenWalletConnectModalParams) => {
    const openModal = async (provider: EthereumProvider, resolve, reject) => {
      setWalletConnectBusy(true);

      if (restoreSession) {
        // try to restore session
        // get pairings
        // if we have an existing pairing with a topic -> activate
        // if then the ethereumProvider is connected and has a session
        // call connectCallback and return
        // if not we need to create a new session

        try {
          const existingPairings = provider?.signer.client.core.pairing.getPairings();
          if (existingPairings && existingPairings.length > 0 && existingPairings[0].topic !== '') {
            provider?.signer.client.core.pairing.activate({ topic: existingPairings[0].topic })
              .then(() => {
                if (connectCallback && provider.connected && provider.session) {
                  connectCallback(provider);
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
                    provider?.connect();
                  }
                }
              })
              .catch((err) => {
                // eslint-disable-next-line no-console
                console.error('activate existing pairing error', err);
              });
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err);
        }
      }

      // Hook into next available display_uri
      provider?.once('display_uri', (data) => {
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

      provider?.once('connect', () => {
        walletConnectModal?.closeModal();
        // reset the display uri once it has been successfully used for connection
        displayUri.current = '';

        if (connectCallback && provider.connected) {
          connectCallback(provider);
        }
      });

      // if we have a display uri that hasn't been used and no connected session
      // open the modal
      if (displayUri.current !== '' && !provider?.session) {
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
      } else if (!provider?.session || !restoreSession) {
        // if we don't have a display uri and no connected session
        // call connect to generate display_uri event
        provider?.connect();
      }
    };

    return new Promise((resolve, reject) => {
      if (!ethereumProvider || !walletConnectModal) {
        // Provider not ready so wait for it
        WalletConnectManager.getInstance()
          .getProvider()
          .then((provider) => {
            openModal(provider, resolve, reject);
          });
      } else {
        openModal(ethereumProvider, resolve, reject);
      }
    });
  }, [ethereumProvider, walletConnectModal, isWalletConnectEnabled]);

  const getWalletLogoUrl = useCallback(async () => await WalletConnectManager.getInstance().getWalletLogoUrl(), []);
  const getWalletName = useCallback(() => {
    if (!ethereumProvider || !ethereumProvider.session) return 'Other';
    let peerName = ethereumProvider.session.peer.metadata.name;
    peerName = peerName.replace('Wallet', '');
    peerName = peerName.replace('wallet', '');
    peerName = peerName.trim();
    return peerName;
  }, [ethereumProvider]);

  return {
    isWalletConnectEnabled,
    ethereumProvider,
    walletConnectBusy,
    walletConnectModal,
    openWalletConnectModal,
    getWalletLogoUrl,
    getWalletName,
  };
};
