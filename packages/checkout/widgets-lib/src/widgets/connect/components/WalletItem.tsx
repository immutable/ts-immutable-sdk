import { WalletProviderName, WalletInfo } from '@imtbl/checkout-sdk';
import { Box, MenuItem } from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { getWalletLogoByName } from 'lib/logoUtils';

export interface WalletProps {
  onWalletClick: (walletProviderName: WalletProviderName) => void;
  wallet: WalletInfo;
}
export function WalletItem(props: WalletProps) {
  const { t } = useTranslation();
  const { wallet, onWalletClick } = props;

  return (
    <MenuItem
      testId={`wallet-list-${wallet.walletProviderName}`}
      size="medium"
      emphasized
      onClick={() => onWalletClick(wallet.walletProviderName)}
      sx={{ marginBottom: 'base.spacing.x1' }}
    >
      <MenuItem.FramedLogo
        logo={getWalletLogoByName(wallet.walletProviderName) as any}
        sx={{ backgroundColor: 'base.color.translucent.standard.200' }}
      />
      <MenuItem.Label size="medium">
        {t(`wallets.${wallet.walletProviderName}.heading`)}
      </MenuItem.Label>
      <MenuItem.IntentIcon />
      <MenuItem.Caption>
        {wallet.walletProviderName === WalletProviderName.PASSPORT ? (
          <Box rc={<span />} sx={{ c: 'base.gradient.1' }}>
            {t(`wallets.${wallet.walletProviderName}.accentText`)}
          </Box>
        ) : null}
        {' '}
        {t(`wallets.${wallet.walletProviderName}.description`)}
      </MenuItem.Caption>
    </MenuItem>
  );
}
