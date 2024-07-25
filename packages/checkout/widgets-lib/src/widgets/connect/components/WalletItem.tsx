import { Badge, Box, MenuItem } from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { cloneElement, ReactElement, useState } from 'react';
import { EIP6963ProviderDetail, WalletProviderName } from '@imtbl/checkout-sdk';
import { RawImage } from '../../../components/RawImage/RawImage';
import { getProviderSlugFromRdns } from '../../../lib/provider';
import useIsSmallScreen from '../../../lib/hooks/useIsSmallScreen';

export interface WalletProps<RC extends ReactElement | undefined = undefined> {
  loading?: boolean;
  recommended?: boolean;
  onWalletItemClick: (providerDetail: EIP6963ProviderDetail) => void;
  providerDetail: EIP6963ProviderDetail;
  rc?: RC;
}

export function WalletItem<
  RC extends ReactElement | undefined = undefined,
>({
  rc = <span />,
  loading = false,
  recommended = false,
  providerDetail,
  onWalletItemClick,
}: WalletProps<RC>) {
  const { t } = useTranslation();
  const { isSmallScreenMode } = useIsSmallScreen();
  const [busy, setBusy] = useState(false);
  const providerSlug = getProviderSlugFromRdns(providerDetail.info.rdns);
  const isPassport = providerSlug === WalletProviderName.PASSPORT;
  const isPassportOrMetamask = isPassport || providerSlug === WalletProviderName.METAMASK;
  const offsetStyles = { marginLeft: '65px' };

  return (
    <MenuItem
      rc={cloneElement(rc, {
        onClick: async () => {
          if (loading) return;
          setBusy(true);
          // let the parent handle errors
          try {
            await onWalletItemClick(providerDetail);
          } finally {
            setBusy(false);
          }
        },
      })}
      testId={`wallet-list-${providerDetail.info.rdns}`}
      size="medium"
      emphasized
      sx={{
        marginBottom: 'base.spacing.x1',
        position: 'relative',

      }}
    >
      <RawImage
        src={providerDetail.info.icon}
        alt={providerDetail.info.name}
        sx={{
          position: 'absolute',
          left: 'base.spacing.x3',
        }}
      />
      <MenuItem.Label
        size="medium"
        sx={{
          ...offsetStyles,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          WebkitLineClamp: 3,
        }}
      >
        {((recommended && isSmallScreenMode) && (
          <Badge
            variant="guidance"
            isAnimated={false}
            badgeContent={t('wallets.recommended')}
            sx={{
              display: 'inline-flex',
              marginBottom: 'base.spacing.x1',

            }}
          />
        ))}
        <Box>{providerDetail.info.name}</Box>
      </MenuItem.Label>
      {(!busy && <MenuItem.IntentIcon />)}
      <MenuItem.Caption sx={{ ...offsetStyles }}>
        {(isPassportOrMetamask) && t(`wallets.${providerSlug}.description`)}
      </MenuItem.Caption>
      {(((recommended || busy) && !isSmallScreenMode) && (
        <MenuItem.Badge
          variant="guidance"
          isAnimated={busy}
          badgeContent={busy ? '' : t('wallets.recommended')}
        />
      ))}
    </MenuItem>
  );
}
