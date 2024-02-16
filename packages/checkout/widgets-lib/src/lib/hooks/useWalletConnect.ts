import { useCallback, useEffect, useState } from 'react';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { WalletConnectModal } from '@walletconnect/modal';
import { WalletConnectManager } from '../walletConnect';

export const useWalletConnect = () => {
  const [ethereumProvider, setEthereumProvider] = useState<EthereumProvider | null>(null);
  const [walletConnectModal, setWalletConnectModal] = useState<WalletConnectModal | null>(null);
  // const [displayUri, setDisplayUri] = useState<WalletConnectModal | null>(null);

  useEffect(() => {
    (async () => setEthereumProvider(await WalletConnectManager.getInstance().getProvider()))();
    setWalletConnectModal(WalletConnectManager.getInstance().getModal());

    // const subscription = WalletConnectManager.getInstance().observeDisplayUri().subscribe({
    //   next: (uri) => {
    //     setDisplayUri(uri);
    //   },
    // });

    // return () => {
    //   subscription.unsubscribe();
    // };
  }, []);

  const getWalletConnectDisplayUri = useCallback(() => {
    // TODO: Need to hook up this is where we generate the displayUri (maybe doesnt need a callback)
    const uri = WalletConnectManager.getInstance().displayUri;
    return uri;
  }, []);

  return {
    ethereumProvider,
    walletConnectModal,
    getWalletConnectDisplayUri,
  };
};
