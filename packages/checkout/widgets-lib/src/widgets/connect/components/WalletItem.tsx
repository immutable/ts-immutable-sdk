import {
  Box,
  MenuItem,
  useConvertSxToEmotionStyles,
} from '@biom3/react';
import { EIP6963ProviderDetail } from 'mipd/src/types';
import { useTranslation } from 'react-i18next';

export interface WalletProps {
  onWalletClick: (providerDetail: EIP6963ProviderDetail) => void;
  providerDetail: EIP6963ProviderDetail;
}
export function WalletItem(props: WalletProps) {
  const { t } = useTranslation();
  const { providerDetail, onWalletClick } = props;

  const allStyles = {
    minw: '16px',
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
    position: 'absolute',
    width: '48px',
    height: '100%',
    top: '0',
    left: '0',
    objectFit: 'cover',
    objectPosition: '50% 50%',
  };

  return (
    <MenuItem
      testId={`wallet-list-${providerDetail.info.rdns}`}
      size="medium"
      emphasized
      onClick={() => onWalletClick(providerDetail)}
      sx={{ marginBottom: 'base.spacing.x1', position: 'relative' }}
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
          <>
            <Box rc={<span />} sx={{ c: 'base.gradient.1' }}>
              {t('wallets.passport.accentText')}
            </Box>
            {` ${t('wallets.passport.description')}`}
          </>
        ) : null}
      </MenuItem.Caption>
    </MenuItem>
  );
}
