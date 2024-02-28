import { Box, MenuItem, useConvertSxToEmotionStyles } from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { EIP6963ProviderDetail } from 'mipd/src/types';
import { EIP1193Provider } from 'mipd';
import { ReactElement } from 'react';
import { getProviderSlugFromRdns } from '../../../lib/eip6963';

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
  const isPassportOrMetamask = providerSlug === 'passport' || providerSlug === 'metamask';

  // const logo = {
  //   [WalletProviderName.PASSPORT]: 'PassportSymbolOutlined',
  //   [WalletProviderName.METAMASK]: 'MetaMaskSymbol',
  // };

  const allStyles = {
    minw: '16px',
    padding: '8px',
    display: 'flex',
    bg: 'base.color.translucent.standard.100',
    overflow: 'hidden',
    borderRadius: '4px',
    objectFit: 'cover',
    objectPosition: 'center',
    backgroundColor: 'base.color.translucent.standard.200',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    width: '48px',
    height: '48px',
    position: 'absolute',
  };

  const customStyles = {
    width: '32px',
    height: '100%',
    objectFit: 'contain',
    objectPosition: '50% 50%',
  };

  return (
    <MenuItem
      rc={rc}
      testId={`wallet-list-${providerDetail.info.rdns}`}
      size="medium"
      emphasized
      onClick={() => onWalletClick(providerDetail)}
      sx={{ marginBottom: 'base.spacing.x1' }}
    >
      <Box
        className="FramedImage AspectRatioImage"
        sx={allStyles}
        rc={<span />}
      >
        <img
          src={providerDetail.info.icon}
          alt={providerDetail.info.name}
          className="CloudImage"
          style={useConvertSxToEmotionStyles(customStyles)}
          loading="lazy"
        />
      </Box>
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
