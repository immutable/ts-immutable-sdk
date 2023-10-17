import { Body, Box } from '@biom3/react';
import { quickswapFooterStyles, quickswapFooterDisclaimerTextStyles, quickswapFooterLogoStyles } from './FooterStyles';
import { ReactComponent as QuickswapLogo } from '../../assets/QuickswapLogo.svg';

export function QuickswapFooter() {
  return (
    <Box testId="quickswap-footer-container" sx={quickswapFooterStyles}>
      <Box testId="quickswap-logo" sx={quickswapFooterLogoStyles}>
        <Body size="xSmall">
          By
        </Body>
        <QuickswapLogo />
      </Box>
      <Body testId="quickswap-footer-disclaimer-text" size="xSmall" sx={quickswapFooterDisclaimerTextStyles}>
        Quickswap is a third party application. Immutable neither builds, owns, operates or deploys Quickswap.
      </Body>
    </Box>
  );
}
