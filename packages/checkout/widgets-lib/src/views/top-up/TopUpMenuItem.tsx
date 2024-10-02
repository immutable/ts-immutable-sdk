import {
  AllSingleVariantIconKeys, Box, type IconProps, isDualVariantIcon, MenuItem,
} from '@biom3/react';
import type { ReactNode } from 'react';

export interface TopUpMenuItemProps {
  testId: string;
  icon: IconProps['icon'];
  iconVariant?: IconProps['variant'];
  intentIcon?: IconProps['icon'];
  heading: string;
  caption: string;
  onClick: () => void;
  renderFeeFunction: (fees: string, feesLoading: boolean) => ReactNode;
  isDisabled: boolean;
}

export function TopUpMenuItem({
  testId, icon, iconVariant, intentIcon, heading, caption, onClick, renderFeeFunction, isDisabled,
}: TopUpMenuItemProps) {
  return (
    <Box testId="top-up-view" sx={{ paddingY: '1px' }}>
      <MenuItem
        testId={`menu-item-${testId}`}
        size="small"
        emphasized
        onClick={!isDisabled ? onClick : undefined}
        sx={isDisabled ? { opacity: '0.5', cursor: 'not-allowed' } : {}}
      >
        {isDualVariantIcon(icon) ? (
          <MenuItem.Icon
            icon={icon}
            variant={iconVariant}
          />
        ) : (
          <MenuItem.Icon icon={icon} />
        )}
        <MenuItem.Label size="medium">
          {heading}
        </MenuItem.Label>
        <MenuItem.IntentIcon
          icon={intentIcon as AllSingleVariantIconKeys}
        />
        <MenuItem.Caption testId={`menu-item-caption-${testId}`}>
          {caption}
          <br />
          {isDisabled ? '' : renderFeeFunction('-.--', false)}
        </MenuItem.Caption>
      </MenuItem>
    </Box>
  );
}
