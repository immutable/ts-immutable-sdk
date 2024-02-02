import { WalletProviderName } from '@imtbl/checkout-sdk';
import { MenuItem } from '@biom3/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface WalletItemProps {
  testId: string;
  walletProviderName: WalletProviderName
  onWalletClick: (walletProviderName: WalletProviderName) => Promise<void>;
  loading: boolean;
}
export function WalletItem({
  testId,
  walletProviderName,
  onWalletClick,
  loading,
}: WalletItemProps) {
  const { t } = useTranslation();
  const [showLoadingIcon, setShowLoadingIcon] = useState(false);

  const logo = {
    [WalletProviderName.PASSPORT]: 'PassportSymbolOutlined',
    [WalletProviderName.METAMASK]: 'MetaMaskSymbol',
    [WalletProviderName.WALLET_CONNECT]: 'WalletConnectSymbol',
  };

  return (
    <MenuItem
      testId={`${testId}-wallet-list-${walletProviderName}`}
      size="medium"
      emphasized
      onClick={async () => {
        if (loading) return;
        setShowLoadingIcon(true);
        // let the parent handle errors
        try {
          await onWalletClick(walletProviderName);
        } finally {
          setShowLoadingIcon(false);
        }
      }}
    >
      <MenuItem.FramedLogo
        logo={logo[walletProviderName] as any}
        sx={{ backgroundColor: 'base.color.translucent.standard.200' }}
      />
      <MenuItem.Label size="medium">
        {t(`wallets.${walletProviderName}.heading`)}
      </MenuItem.Label>
      {showLoadingIcon && (<MenuItem.StatefulButtCon state="loading" icon="Loading" />)}
    </MenuItem>
  );
}
