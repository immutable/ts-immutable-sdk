import { MenuItem } from '@biom3/react';
import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface WalletConnectItemProps<RC extends ReactElement | undefined = undefined> {
  testId: string;
  onWalletItemClick: () => Promise<void>;
  loading: boolean;
  rc?: RC;
}
export function WalletConnectItem<
  RC extends ReactElement | undefined = undefined,
>({
  rc = <span />,
  testId,
  onWalletItemClick,
  loading,
}: WalletConnectItemProps<RC>) {
  const { t } = useTranslation();
  const [showLoadingIcon, setShowLoadingIcon] = useState(false);

  return (
    <MenuItem
      rc={rc}
      testId={`${testId}-wallet-list-walletconnect`}
      size="medium"
      emphasized
      onClick={async () => {
        if (loading) return;
        setShowLoadingIcon(true);
        // let the parent handle errors
        try {
          await onWalletItemClick();
        } finally {
          setShowLoadingIcon(false);
        }
      }}
    >
      <MenuItem.FramedLogo
        logo="WalletConnectSymbol"
        sx={{ backgroundColor: 'base.color.translucent.standard.200' }}
      />
      <MenuItem.Label size="medium">
        {t('wallets.walletconnect.heading')}
      </MenuItem.Label>
      {showLoadingIcon && (<MenuItem.StatefulButtCon state="loading" icon="Loading" />)}
    </MenuItem>
  );
}
