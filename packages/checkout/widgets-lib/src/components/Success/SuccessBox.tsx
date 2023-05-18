import { Body, Box, Icon } from '@biom3/react';
import { successBoxStyles, successLogoStyles } from './SuccessViewStyles';

export interface SuccessProps {
  successText: string;
}
export function SuccessBox({ successText }: SuccessProps) {
  return (
    <Box sx={successBoxStyles} testId="success-box">
      <Box sx={successLogoStyles}>
        <Icon
          icon="Tick"
          testId="success-icon"
          variant="bold"
          sx={{ width: 'base.icon.size.400', fill: 'base.color.brand.2' }}
        />
      </Box>
      <Body size="medium" weight="bold" testId="success-text">
        {successText}
      </Body>
    </Box>
  );
}
