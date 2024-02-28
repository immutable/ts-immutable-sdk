import { Box, MenuItem } from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { EIP6963ProviderDetail } from 'mipd/src/types';
import { EIP1193Provider } from 'mipd';
import { ReactElement } from 'react';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import { getProviderSlugFromRdns } from '../../../lib/eip6963';
import { RawImage } from '../../../components/RawImage/RawImage';

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
  const isPassportOrMetamask = providerSlug === WalletProviderName.PASSPORT
    || providerSlug === WalletProviderName.METAMASK;

  return (
    <MenuItem
      rc={rc}
      testId={`wallet-list-${providerDetail.info.rdns}`}
      size="medium"
      emphasized
      onClick={() => onWalletClick(providerDetail)}
      sx={{ marginBottom: 'base.spacing.x1' }}
    >
      <RawImage src={providerDetail.info.icon} alt={providerDetail.info.name} sx={{ position: 'absolute' }} />
      <MenuItem.Label size="medium" sx={{ marginLeft: '65px' }}>
        {providerDetail.info.name}
      </MenuItem.Label>
      <MenuItem.IntentIcon sx={{ marginLeft: '65px' }} />
      <MenuItem.Caption sx={{ marginLeft: '65px' }}>
        {providerDetail.info.rdns === 'com.immutable.passport' ? (
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
