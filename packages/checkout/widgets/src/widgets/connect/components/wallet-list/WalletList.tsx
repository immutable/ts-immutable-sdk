import { Box } from '@biom3/react';
import { useContext, useEffect, useState } from 'react';
import { ViewActions, ViewContext } from '../../../../context/ViewContext';
import { ConnectWidgetViews } from '../../../../context/ConnectViewContextTypes';
import {
  ConnectionProviders,
  WalletFilter,
  WalletFilterTypes,
  WalletInfo,
} from '@imtbl/checkout-sdk-web';
import { ConnectActions, ConnectContext } from '../../context/ConnectContext';
import { WalletItem } from './wallet-item';

export interface WalletListProps {
  walletFilterTypes?: WalletFilterTypes;
  excludeWallets?: WalletFilter[];
}

export const WalletList = (props: WalletListProps) => {
  const { walletFilterTypes, excludeWallets } = props;
  const {
    connectDispatch,
    connectState: { checkout },
  } = useContext(ConnectContext);
  const { viewDispatch } = useContext(ViewContext);
  const [wallets, setWallets] = useState<WalletInfo[]>([]);

  useEffect(() => {
    const getAllowedWallets = async () => {
      const allowedWallets = await checkout?.getWalletsAllowList({
        type: walletFilterTypes ?? WalletFilterTypes.DESKTOP,
        exclude: excludeWallets,
      });
      console.log(allowedWallets);
      setWallets(allowedWallets?.wallets || []);
    };
    getAllowedWallets();
  }, [checkout, excludeWallets, walletFilterTypes]);

  const onWalletClick = (providerPreference: ConnectionProviders) => {
    console.log('clicked');
    connectDispatch({
      payload: {
        type: ConnectActions.SET_PROVIDER_PREFERENCE,
        providerPreference,
      },
    });
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: { type: ConnectWidgetViews.READY_TO_CONNECT },
      },
    });
  };

  return (
    <Box
      testId="wallet-list"
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      {wallets.map((wallet) => (
        <WalletItem
          onWalletClick={onWalletClick}
          wallet={wallet}
          key={wallet.name}
        />
      ))}
    </Box>
  );
};
