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
  const [busy, setBusy] = useState(false);

  return (
    <MenuItem
      rc={rc}
      testId={`${testId}-wallet-list-walletconnect`}
      size="medium"
      emphasized
      onClick={async () => {
        if (loading) return;
        setBusy(true);
        // let the parent handle errors
        try {
          await onWalletItemClick();
        } finally {
          setBusy(false);
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
      {(busy && (
        <MenuItem.Badge
          variant="guidance"
          isAnimated={busy}
        />
      ))}
    </MenuItem>
  );
}
