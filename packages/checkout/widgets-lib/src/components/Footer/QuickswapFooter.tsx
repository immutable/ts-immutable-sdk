/* eslint-disable max-len */
import { Body, Box } from '@biom3/react';
import { WidgetTheme } from '@imtbl/checkout-sdk';
import { quickswapFooterStyles, quickswapFooterDisclaimerTextStyles, quickswapFooterLogoStyles } from './FooterStyles';
import { text } from '../../resources/text/textConfig';
import QuickswapLogoLight from '../../assets/QuickswapLogoLight.svg';
import QuickswapLogoDark from '../../assets/QuickswapLogoDark.svg';

export interface QuickswapFooterProps {
  theme: WidgetTheme;
}

export function QuickswapFooter({ theme }: QuickswapFooterProps) {
  const { disclaimerText } = text.footers.quickswapFooter;

  return (
    <Box testId="quickswap-footer-container" sx={quickswapFooterStyles}>
      <Box testId="quickswap-logo" sx={quickswapFooterLogoStyles}>
        <Body size="xSmall" sx={{ paddingRight: 'base.spacing.x1' }}>
          By
        </Body>
        {theme === WidgetTheme.DARK ? <QuickswapLogoDark /> : <QuickswapLogoLight />}
      </Box>
      <Body testId="quickswap-footer-disclaimer-text" size="xSmall" sx={quickswapFooterDisclaimerTextStyles}>
        {disclaimerText}
      </Body>
    </Box>
  );
}
