import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { WalletConnectModal } from '@walletconnect/modal';
import { Checkout } from '@imtbl/checkout-sdk';
import { EIP6963ProviderInfo } from 'mipd';
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
        connectConfig?.walletConnect && WalletConnectManager.getInstance().isInitialised,
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

  const getWalletLogoUrl = useCallback(async () => await WalletConnectManager.getInstance().getWalletLogoUrl(), []);

  const walletConnectProviderInfo = {
    name: 'WalletConnect',
    rdns: 'walletconnect',
    // eslint-disable-next-line max-len
    icon: 'data:image/svg+xml,<svg viewBox="0 0 48 48" class="SvgIcon undefined Logo Logo--WalletConnectSymbol css-uz7d3j-SvgIcon" xmlns="http://www.w3.org/2000/svg"><g data-testid="undefined__g"><path d="M10.4236 14.8686C17.9507 7.52377 30.1694 7.52377 37.6964 14.8686L38.6026 15.7593C38.9826 16.1244 38.9826 16.7231 38.6026 17.0881L35.5041 20.1108C35.3141 20.3006 35.0071 20.3006 34.8171 20.1108L33.5748 18.8988C28.3132 13.7735 19.8069 13.7735 14.5452 18.8988L13.2152 20.1984C13.0252 20.3882 12.7183 20.3882 12.5283 20.1984L9.42978 17.1757C9.04977 16.8107 9.04977 16.212 9.42978 15.847L10.4236 14.8686ZM44.1127 21.1183L46.875 23.8051C47.255 24.1701 47.255 24.7688 46.875 25.1339L34.4371 37.2682C34.0571 37.6332 33.4433 37.6332 33.0779 37.2682L24.25 28.653C24.1623 28.5654 24.0016 28.5654 23.9139 28.653L15.086 37.2682C14.706 37.6332 14.0922 37.6332 13.7268 37.2682L1.24503 25.1339C0.86502 24.7688 0.86502 24.1701 1.24503 23.8051L4.00738 21.1183C4.38739 20.7533 5.00125 20.7533 5.36664 21.1183L14.1945 29.7335C14.2822 29.8211 14.4429 29.8211 14.5306 29.7335L23.3585 21.1183C23.7385 20.7533 24.3523 20.7533 24.7177 21.1183L33.5456 29.7335C33.6333 29.8211 33.794 29.8211 33.8817 29.7335L42.7096 21.1183C43.1188 20.7533 43.7327 20.7533 44.1127 21.1183Z" fill="#368AFA"></path></g></svg>',
    uuid: 'wallet-connect',
  } as EIP6963ProviderInfo;

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
