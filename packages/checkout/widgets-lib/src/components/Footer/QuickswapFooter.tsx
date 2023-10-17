import { Body, Box } from '@biom3/react';
import { WidgetTheme } from '@imtbl/checkout-widgets';
import { quickswapFooterStyles, quickswapFooterDisclaimerTextStyles, quickswapFooterLogoStyles } from './FooterStyles';
import { ReactComponent as QuickswapLogoDark } from '../../assets/QuickswapLogoDark.svg';
import { ReactComponent as QuickswapLogoLight } from '../../assets/QuickswapLogoLight.svg';

export interface QuickswapFooterProps {
  theme: WidgetTheme;
}

export function QuickswapFooter({ theme }: QuickswapFooterProps) {
  return (
    <Box testId="quickswap-footer-container" sx={quickswapFooterStyles}>
      <Box testId="quickswap-logo" sx={quickswapFooterLogoStyles}>
        <Body size="xSmall" sx={{ paddingRight: 'base.spacing.x1' }}>
          By
        </Body>
        {theme === WidgetTheme.DARK ? <QuickswapLogoDark /> : <QuickswapLogoLight />}
      </Box>
      <Body testId="quickswap-footer-disclaimer-text" size="xSmall" sx={quickswapFooterDisclaimerTextStyles}>
        Quickswap is a third party application. Immutable neither builds, owns, operates or deploys Quickswap.
      </Body>
    </Box>
  );
}
