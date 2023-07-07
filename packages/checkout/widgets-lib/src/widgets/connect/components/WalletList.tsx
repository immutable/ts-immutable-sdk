import { Box } from '@biom3/react';
import {
  WalletFilterTypes,
  WalletFilter,
  WalletInfo,
  WalletProviderName,
} from '@imtbl/checkout-sdk';
import { useContext, useState, useEffect } from 'react';
import { ConnectWidgetViews } from '../../../context/view-context/ConnectViewContextTypes';
import { ConnectContext, ConnectActions } from '../context/ConnectContext';
import { WalletItem } from './WalletItem';
import {
  ViewContext,
  ViewActions,
  SharedViews,
} from '../../../context/view-context/ViewContext';

export interface WalletListProps {
  walletFilterTypes?: WalletFilterTypes;
  excludeWallets?: WalletFilter[];
}

export function WalletList(props: WalletListProps) {
  const { walletFilterTypes, excludeWallets } = props;
  const {
    connectDispatch,
    connectState: { checkout },
  } = useContext(ConnectContext);
  const { viewDispatch } = useContext(ViewContext);
  const [wallets, setWallets] = useState<WalletInfo[]>([]);

  useEffect(() => {
    const getAllowedWallets = async () => {
      const allowedWallets = await checkout?.getWalletAllowList({
        type: walletFilterTypes ?? WalletFilterTypes.ALL,
        exclude: excludeWallets,
      });
      setWallets(allowedWallets?.wallets || []);
    };
    getAllowedWallets();
  }, [checkout, excludeWallets, walletFilterTypes]);

  const onWalletClick = async (walletProvider: WalletProviderName) => {
    if (checkout) {
      try {
        const connectResult = await checkout.createProvider({
          walletProvider,
        });

        connectDispatch({
          payload: {
            type: ConnectActions.SET_PROVIDER,
            provider: connectResult.provider,
          },
        });
        connectDispatch({
          payload: {
            type: ConnectActions.SET_PROVIDER_NAME,
            walletProvider,
          },
        });
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: { type: ConnectWidgetViews.READY_TO_CONNECT },
          },
        });
      } catch (err: any) {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: { type: SharedViews.ERROR_VIEW, error: err },
          },
        });
      }
    }
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
}
