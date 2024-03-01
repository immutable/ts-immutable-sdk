import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { WalletConnectModal } from '@walletconnect/modal';
import { EIP6963ProviderInfo } from 'mipd';
import { WalletConnectManager } from '../walletConnect';

export interface OpenWalletConnectModalParams {
  connectCallback: (ethereumProvider: EthereumProvider) => void
  restoreSession?: boolean
}

export const walletConnectProviderInfo = {
  name: 'Other',
  rdns: 'walletconnect',
  // eslint-disable-next-line max-len
  icon: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNDggNDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGc+PHBhdGggZD0iTTEwLjQyMzYgMTQuODY4NkMxNy45NTA3IDcuNTIzNzcgMzAuMTY5NCA3LjUyMzc3IDM3LjY5NjQgMTQuODY4NkwzOC42MDI2IDE1Ljc1OTNDMzguOTgyNiAxNi4xMjQ0IDM4Ljk4MjYgMTYuNzIzMSAzOC42MDI2IDE3LjA4ODFMMzUuNTA0MSAyMC4xMTA4QzM1LjMxNDEgMjAuMzAwNiAzNS4wMDcxIDIwLjMwMDYgMzQuODE3MSAyMC4xMTA4TDMzLjU3NDggMTguODk4OEMyOC4zMTMyIDEzLjc3MzUgMTkuODA2OSAxMy43NzM1IDE0LjU0NTIgMTguODk4OEwxMy4yMTUyIDIwLjE5ODRDMTMuMDI1MiAyMC4zODgyIDEyLjcxODMgMjAuMzg4MiAxMi41MjgzIDIwLjE5ODRMOS40Mjk3OCAxNy4xNzU3QzkuMDQ5NzcgMTYuODEwNyA5LjA0OTc3IDE2LjIxMiA5LjQyOTc4IDE1Ljg0N0wxMC40MjM2IDE0Ljg2ODZaTTQ0LjExMjcgMjEuMTE4M0w0Ni44NzUgMjMuODA1MUM0Ny4yNTUgMjQuMTcwMSA0Ny4yNTUgMjQuNzY4OCA0Ni44NzUgMjUuMTMzOUwzNC40MzcxIDM3LjI2ODJDMzQuMDU3MSAzNy42MzMyIDMzLjQ0MzMgMzcuNjMzMiAzMy4wNzc5IDM3LjI2ODJMMjQuMjUgMjguNjUzQzI0LjE2MjMgMjguNTY1NCAyNC4wMDE2IDI4LjU2NTQgMjMuOTEzOSAyOC42NTNMMTUuMDg2IDM3LjI2ODJDMTQuNzA2IDM3LjYzMzIgMTQuMDkyMiAzNy42MzMyIDEzLjcyNjggMzcuMjY4MkwxLjI0NTAzIDI1LjEzMzlDMC44NjUwMiAyNC43Njg4IDAuODY1MDIgMjQuMTcwMSAxLjI0NTAzIDIzLjgwNTFMNC4wMDczOCAyMS4xMTgzQzQuMzg3MzkgMjAuNzUzMyA1LjAwMTI1IDIwLjc1MzMgNS4zNjY2NCAyMS4xMTgzTDE0LjE5NDUgMjkuNzMzNUMxNC4yODIyIDI5LjgyMTEgMTQuNDQyOSAyOS44MjExIDE0LjUzMDYgMjkuNzMzNUwyMy4zNTg1IDIxLjExODNDMjMuNzM4NSAyMC43NTMzIDI0LjM1MjMgMjAuNzUzMyAyNC43MTc3IDIxLjExODNMMzMuNTQ1NiAyOS43MzM1QzMzLjYzMzMgMjkuODIxMSAzMy43OTQgMjkuODIxMSAzMy44ODE3IDI5LjczMzVMNDIuNzA5NiAyMS4xMTgzQzQzLjExODggMjAuNzUzMyA0My43MzI3IDIwLjc1MzMgNDQuMTEyNyAyMS4xMTgzWiIgZmlsbD0iIzM2OEFGQSI+PC9wYXRoPjwvZz48L3N2Zz4=',
  uuid: 'wallet-connect',
} as EIP6963ProviderInfo;

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
        console.log('walletConnectModal', walletConnectModal, data);
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

  const getWalletLogoUrl = useCallback(async () => await WalletConnectManager.getInstance().getWalletLogoUrl(), []);

  return {
    isWalletConnectEnabled,
    ethereumProvider,
    walletConnectBusy,
    walletConnectModal,
    openWalletConnectModal,
    getWalletLogoUrl,
    walletConnectProviderInfo,
  };
};
