import { useTranslation } from 'react-i18next';
import { MenuItem } from '@biom3/react';
import { useState } from 'react';
import { useWalletConnect } from '../../../lib/hooks/useWalletConnect';

export type WalletConnectItemProps = {
  onConnect: () => void;
  loading?: boolean;
};

export function WalletConnectItem({
  onConnect,
  loading = false,
}: WalletConnectItemProps) {
  const { t } = useTranslation();
  const { walletConnectBusy } = useWalletConnect();
  const [busy, setBusy] = useState(false);

  return (
    <MenuItem
      testId="wallet-list-walletconnect"
      size="medium"
      emphasized
      disabled={walletConnectBusy}
      onClick={async () => {
        if (loading) return;
        setBusy(true);
        // let the parent handle errors
        try {
          await onConnect();
        } finally {
          setBusy(false);
        }
      }}
      sx={{ marginBottom: 'base.spacing.x1' }}
    >
      <MenuItem.FramedLogo
        logo="WalletConnectSymbol"
        sx={{ backgroundColor: 'base.color.translucent.standard.200' }}
      />
      <MenuItem.Label size="medium">
        {t('wallets.walletconnect.heading')}
      </MenuItem.Label>
      {(!busy && <MenuItem.IntentIcon />)}
      <MenuItem.Caption sx={{ width: '230px' }}>
        {t('wallets.walletconnect.description')}
      </MenuItem.Caption>
      {(busy && (
        <MenuItem.Badge
          variant="guidance"
          isAnimated={busy}
        />
      ))}
    </MenuItem>
  );
}
