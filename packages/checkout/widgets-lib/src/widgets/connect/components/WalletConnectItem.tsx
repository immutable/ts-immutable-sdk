import { useTranslation } from 'react-i18next';
import { MenuItem } from '@biom3/react';
import { useWalletConnect } from '../../../lib/hooks/useWalletConnect';

export type WalletConnectItemProps = {
  onConnect: () => void;
};

export function WalletConnectItem({
  onConnect,
}: WalletConnectItemProps) {
  const { t } = useTranslation();
  const { walletConnectBusy } = useWalletConnect();

  return (
    <MenuItem
      testId="wallet-list-walletconnect"
      size="medium"
      emphasized
      disabled={walletConnectBusy}
      onClick={() => onConnect()}
      sx={{ marginBottom: 'base.spacing.x1' }}
    >
      <MenuItem.FramedLogo
        logo="WalletConnectSymbol"
        sx={{ backgroundColor: 'base.color.translucent.standard.200' }}
      />
      <MenuItem.Label size="medium">
        {t('wallets.walletconnect.heading')}
      </MenuItem.Label>
      <MenuItem.IntentIcon />
      <MenuItem.Caption>
        {t('wallets.walletconnect.description')}
      </MenuItem.Caption>
    </MenuItem>
  );
}
