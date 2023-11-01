/* eslint-disable max-len */
import { Box } from '@biom3/react';
import { heroBackGroundStyles, heroImageBottomAlign, heroImageStyles } from './HeroImageStyles';
import WalletApprove from '../../assets/WalletApprove.svg';

export function WalletApproveHero() {
  return (
    <Box sx={{ ...heroBackGroundStyles, background: 'base.color.translucent.emphasis.100' }}>
      <Box sx={{ ...heroImageStyles, ...heroImageBottomAlign }}>
        <WalletApprove />
      </Box>
    </Box>
  );
}
