import { Box } from '@biom3/react';
import { centeredBoxContentStyles } from './CenteredBoxStyles';

export interface CenteredBoxContentProps {
  testId?: string;
  children?: React.ReactNode;
}
export function CenteredBoxContent({
  children,
  testId,
}: CenteredBoxContentProps) {
  return (
    <Box testId={testId} sx={centeredBoxContentStyles}>
      {children}
    </Box>
  );
}
