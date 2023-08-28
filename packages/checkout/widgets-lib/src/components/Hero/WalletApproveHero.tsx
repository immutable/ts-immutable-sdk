import { Box } from '@biom3/react';
import { ReactComponent as Wallet } from '../../assets/WalletApprove.svg';
import { heroBackGroundStyles, heroImageBottomAlign, heroImageStyles } from './HeroImageStyles';

export function WalletApproveHero() {
  return (
    <Box sx={{ ...heroBackGroundStyles, background: 'base.color.translucent.emphasis.100' }}>
      <Box sx={{ ...heroImageStyles, ...heroImageBottomAlign }}>
        <Wallet />
      </Box>
    </Box>
  );
}
