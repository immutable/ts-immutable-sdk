import { MenuItem } from '@biom3/react';
import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EIP6963ProviderDetail } from '@imtbl/checkout-sdk';
import { RawImage } from '../RawImage/RawImage';

export interface WalletItemProps<RC extends ReactElement | undefined = undefined> {
  loading?: boolean;
  recommended?: boolean;
  testId: string;
  providerDetail: EIP6963ProviderDetail;
  onWalletItemClick: (providerDetail: EIP6963ProviderDetail) => Promise<void>;
  rc?: RC;
}

export function WalletItem<
  RC extends ReactElement | undefined = undefined,
>({
  rc = <span />,
  testId,
  loading = false,
  recommended = false,
  providerDetail,
  onWalletItemClick,
}: WalletItemProps<RC>) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  return (
    <MenuItem
      rc={rc}
      testId={`${testId}-wallet-list-${providerDetail.info.rdns}`}
      size="medium"
      emphasized
      onClick={async () => {
        if (loading) return;
        setBusy(true);
        // let the parent handle errors
        try {
          await onWalletItemClick(providerDetail);
        } finally {
          setBusy(false);
        }
      }}
      sx={{ position: 'relative' }}
    >
      <RawImage
        src={providerDetail.info.icon}
        alt={providerDetail.info.name}
        sx={{
          position: 'absolute',
          left: 'base.spacing.x3',
        }}
      />
      <MenuItem.Label size="medium" sx={{ marginLeft: '65px' }}>
        {providerDetail.info.name}
      </MenuItem.Label>
      {((recommended || busy) && (
        <MenuItem.Badge
          variant="guidance"
          isAnimated={busy}
          badgeContent={busy ? '' : t('wallets.recommended')}
        />
      ))}
    </MenuItem>
  );
}
