import { Box, MenuItem } from '@biom3/react';
import { ReactNode } from 'react';

export interface TopUpMenuItemProps {
  testId: string;
  icon: 'Wallet' | 'Coins' | 'Minting',
  heading: string;
  caption: string,
  subcaption: string,
  onClick: () => void,
  renderFeeFunction: (fees: string, feesLoading: boolean) => ReactNode,
}

export function TopUpMenuItem({
  testId, icon, heading, caption, subcaption, onClick, renderFeeFunction,
}: TopUpMenuItemProps) {
  return (
    <Box testId="top-up-view" sx={{ paddingY: '1px' }}>
      <MenuItem
        testId={`menu-item-${testId}`}
        size="medium"
        emphasized
        onClick={onClick}
      >
        <MenuItem.Icon
          icon={icon}
        />
        <MenuItem.Label size="medium">
          {heading}
        </MenuItem.Label>
        <MenuItem.IntentIcon />
        <MenuItem.Caption testId={`menu-item-caption-${testId}`}>
          {caption}
          <br />
          {subcaption}
          {' '}
          {renderFeeFunction('-.--', false)}
        </MenuItem.Caption>
      </MenuItem>
    </Box>
  );
}
