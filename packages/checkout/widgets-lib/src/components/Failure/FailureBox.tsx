import { Body, Box, Icon } from '@biom3/react';
import { failureBoxStyles, failureLogoStyles } from './FailureViewStyles';

export interface FailureProps {
  failText: string;
}
export function FailureBox({ failText }: FailureProps) {
  return (
    <Box sx={failureBoxStyles} testId="failure-box">
      <Box sx={failureLogoStyles}>
        <Icon
          icon="Close"
          testId="fail-icon"
          variant="bold"
          sx={{ width: 'base.icon.size.400', fill: 'base.color.brand.2' }}
        />
      </Box>
      <Body size="medium" weight="bold" testId="fail-text">
        {failText}
      </Body>
    </Box>
  );
}
