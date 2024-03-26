/* eslint-disable max-len */
import { Body, Box } from '@biom3/react';
import { WidgetTheme } from '@imtbl/checkout-sdk';
import { useTranslation } from 'react-i18next';
import { Environment } from '@imtbl/config';
import { getRemoteImage } from 'lib/utils';
import { quickswapFooterStyles, quickswapFooterDisclaimerTextStyles, quickswapFooterLogoStyles } from './FooterStyles';

export interface QuickswapFooterProps {
  theme: WidgetTheme;
  environment: Environment | undefined,
}

export function QuickswapFooter({ theme, environment }: QuickswapFooterProps) {
  const { t } = useTranslation();

  const logo = theme === WidgetTheme.DARK
    ? getRemoteImage(environment, '/quickswapdark.webp')
    : getRemoteImage(environment, '/quickswaplight.webp');

  return (
    <Box testId="quickswap-footer-container" sx={quickswapFooterStyles}>
      <Box testId="quickswap-logo" sx={quickswapFooterLogoStyles}>
        <Body size="xSmall" sx={{ paddingRight: 'base.spacing.x1' }}>
          By
        </Body>
        <img style={{ height: '26px' }} alt="Quickswap logo" src={logo} />
      </Box>
      <Body testId="quickswap-footer-disclaimer-text" size="xSmall" sx={quickswapFooterDisclaimerTextStyles}>
        {t('footers.quickswapFooter.disclaimerText')}
      </Body>
    </Box>
  );
}
