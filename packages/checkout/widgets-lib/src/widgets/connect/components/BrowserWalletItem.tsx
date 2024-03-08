import { useTranslation } from 'react-i18next';
import {
  Box,
  MenuItem,
} from '@biom3/react';
import { EIP1193Provider, EIP6963ProviderDetail } from '../../../lib/provider';
import { RawImage } from '../../../components/RawImage/RawImage';

const maskImagePrefix = 'url(\'data:image/svg+xml;utf8,';
const svgXmlns = 'xmlns="http://www.w3.org/2000/svg"';

export type BrowserWalletItemProps = {
  onClick: () => void;
  providers?: EIP6963ProviderDetail<EIP1193Provider>[];
};

export function BrowserWalletItem({
  onClick,
  providers,
}: BrowserWalletItemProps) {
  const { t } = useTranslation();

  return (
    <MenuItem
      testId="wallet-list-browserwallet"
      size="medium"
      emphasized
      onClick={() => onClick()}
      sx={{ marginBottom: 'base.spacing.x1' }}
    >
      {((providers || []).length > 0) && (
        <Box
          testId="wallet-list-browserwallet-stack"
          className="SwapStack SwapStack--large SwapStack--left SwapStack--square"
          sx={{
            position: 'absolute',
            left: '14px',
            width: '48px',
            height: '48px',
            padding: '4px',
          }}
        >
          <RawImage
            src={providers![0].info.icon}
            alt={providers![0].info.name}
            testId="wallet-list-browserwallet__rawImage--left"
            className="SwapStack__image SwapStack__image--left"
            sx={{
              position: 'absolute',
              top: '0px',
              left: '0px',
              height: '32px',
              width: '32px',
              display: 'block',
              minWidth: '16px',
              background: '#F3F3F30A',
              overflow: 'hidden',
              borderRadius: '4px',
            }}
          />
          <RawImage
            src={providers![1].info.icon}
            alt={providers![1].info.name}
            testId="wallet-list-browserwallet__rawImage--right"
            sx={{
              position: 'absolute',
              bottom: '0px',
              right: '0px',
              display: 'block',
              width: '32px',
              minWidth: '16px',
              background: '#F3F3F30A',
              overflow: 'hidden',
              borderRadius: '4px',
              objectFit: 'cover',
              objectPosition: 'center',
              height: '32px',
              // eslint-disable-next-line @typescript-eslint/naming-convention,max-len
              WebkitMaskImage: `${maskImagePrefix} <svg viewBox="0 0 32 32" ${svgXmlns}><path d="M8.74698e-06 17.0002V28C8.74698e-06 30.2092 1.79087 32 4.00001 32H28C30.2091 32 32 30.2092 32 28V4.00001C32 1.79087 30.2091 1.38581e-05 28 1.38581e-05H17.0001V12.0002C17.0001 14.7616 14.7616 17.0002 12.0001 17.0002H8.74698e-06Z"/></svg>')`,
            }}
          />
        </Box>
      )}
      {(!providers || providers.length === 0) && (
        <MenuItem.FramedLogo
          logo="MetaMaskSymbol"
          sx={{ backgroundColor: 'base.color.translucent.standard.200' }}
        />
      )}
      <MenuItem.Label size="medium" sx={{ marginLeft: '65px' }}>
        {t('wallets.browserwallet.heading')}
      </MenuItem.Label>
      <MenuItem.IntentIcon />
      <MenuItem.Caption sx={{ marginLeft: '65px', width: '230px' }}>
        {t('wallets.browserwallet.description')}
      </MenuItem.Caption>
    </MenuItem>
  );
}
