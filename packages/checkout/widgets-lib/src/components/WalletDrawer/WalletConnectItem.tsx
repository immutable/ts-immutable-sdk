import { MenuItem, MenuItemProps } from '@biom3/react';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWalletConnect } from '../../lib/hooks/useWalletConnect';

export interface WalletConnectItemProps {
  onWalletItemClick: () => Promise<void>;
  loading: boolean;
  size?: MenuItemProps['size'];
}

export const WalletConnectItem = forwardRef(
  (
    { onWalletItemClick, loading, size = 'medium' }: WalletConnectItemProps,
    ref,
  ) => {
    const { t } = useTranslation();
    const { walletConnectBusy } = useWalletConnect();
    const [busy, setBusy] = useState(false);

    const connect = async () => {
      if (loading) return;
      setBusy(true);
      // let the parent handle errors
      try {
        await onWalletItemClick();
      } finally {
        setBusy(false);
      }
    };

    useImperativeHandle(ref, () => ({
      connect,
    }));

    return (
      <MenuItem
        testId="wallet-list-walletconnect"
        size={size}
        emphasized
        disabled={walletConnectBusy}
        onClick={connect}
        sx={{ marginBottom: 'base.spacing.x1' }}
      >
        <MenuItem.FramedLogo
          logo="WalletConnectSymbol"
          sx={{ backgroundColor: 'base.color.translucent.standard.200' }}
        />
        <MenuItem.Label size="medium">
          {t('wallets.walletconnect.heading')}
        </MenuItem.Label>
        {busy && <MenuItem.Badge variant="guidance" isAnimated={busy} />}
      </MenuItem>
    );
  },
);
