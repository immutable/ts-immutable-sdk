import { Body, Box } from '@biom3/react';
import { quickswapFooterStyles, quickswapFooterDisclaimerTextStyles, quickswapFooterLogoStyles } from './FooterStyles';
import { ReactComponent as QuickswapLogo } from '../../assets/QuickswapLogo.svg';

export function QuickswapFooter() {
  return (
    <Box testId="quickswap-footer-container" sx={quickswapFooterStyles}>
      <Box sx={quickswapFooterLogoStyles}>
        <Body size="xSmall">
          Powered by
        </Body>
        <QuickswapLogo />
      </Box>
      <Body size="xSmall" sx={quickswapFooterDisclaimerTextStyles}>
        Quickswap is a third party application. Immutable neither builds, owns, operates or
        deploys Quickswap. For further info, please refer to Quickswap’s website.
      </Body>
    </Box>
  );
}
