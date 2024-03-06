import { Box, MenuItem } from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { ReactElement } from 'react';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import { RawImage } from '../../../components/RawImage/RawImage';
import { EIP1193Provider, EIP6963ProviderDetail, getProviderSlugFromRdns } from '../../../lib/provider';

export interface WalletProps<RC extends ReactElement | undefined = undefined> {
  onWalletClick: (providerDetail: EIP6963ProviderDetail<EIP1193Provider>) => void;
  providerDetail: EIP6963ProviderDetail<EIP1193Provider>;
  rc?: RC;
}

export function WalletItem<
  RC extends ReactElement | undefined = undefined,
>({
  rc = <span />,
  ...props
}: WalletProps<RC>) {
  const { t } = useTranslation();
  const { providerDetail, onWalletClick } = props;
  const providerSlug = getProviderSlugFromRdns(providerDetail.info.rdns);
  const isPassport = providerSlug === WalletProviderName.PASSPORT;
  const isPassportOrMetamask = isPassport || providerSlug === WalletProviderName.METAMASK;
  const offsetStyles = { marginLeft: '65px' };

  return (
    <MenuItem
      rc={rc}
      testId={`wallet-list-${providerDetail.info.rdns}`}
      size="medium"
      emphasized
      onClick={() => onWalletClick(providerDetail)}
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
      <MenuItem.Label size="medium" sx={offsetStyles}>
        {providerDetail.info.name}
      </MenuItem.Label>
      <MenuItem.IntentIcon sx={offsetStyles} />
      <MenuItem.Caption sx={offsetStyles}>
        {isPassport ? (
          <Box rc={<span />} sx={{ c: 'base.gradient.1' }}>
            {isPassportOrMetamask ? t(`wallets.${providerSlug}.accentText`) : providerDetail.info.name}
          </Box>
        ) : null}
        {' '}
        {(isPassportOrMetamask)
          && t(`wallets.${providerSlug}.description`)}
      </MenuItem.Caption>
    </MenuItem>
  );
}
