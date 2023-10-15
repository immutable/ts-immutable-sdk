import { Box, MenuItem } from '@biom3/react';
import { ReactNode } from 'react';

export interface TopUpMenuItemProps {
  testId: string;
  icon: 'Wallet' | 'Coins' | 'Minting',
  heading: string;
  caption: string,
  subcaption: string,
  disabledCaption: string,
  onClick: () => void,
  renderFeeFunction: (fees: string, feesLoading: boolean) => ReactNode,
  isDisabled :boolean
}

export function TopUpMenuItem({
  testId, icon, heading, caption, subcaption, disabledCaption, onClick, renderFeeFunction, isDisabled,
}: TopUpMenuItemProps) {
  return (
    <Box testId="top-up-view" sx={{ paddingY: '1px' }}>
      <MenuItem
        testId={`menu-item-${testId}`}
        size="medium"
        emphasized
        onClick={!isDisabled ? onClick : undefined}
        sx={isDisabled ? { opacity: '0.5', cursor: 'not-allowed' } : {}}
      >
        <MenuItem.Icon
          icon={icon}
        />
        <MenuItem.Label size="medium">
          {heading}
        </MenuItem.Label>
        <MenuItem.IntentIcon />
        <MenuItem.Caption testId={`menu-item-caption-${testId}`}>
          {isDisabled ? disabledCaption : caption}
          <br />
          {isDisabled ? '' : subcaption}
          {' '}
          {isDisabled ? '' : renderFeeFunction('-.--', false)}
        </MenuItem.Caption>
      </MenuItem>
    </Box>
  );
}
