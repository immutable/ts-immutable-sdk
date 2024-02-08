import { Body, Box, Icon } from '@biom3/react';
import { loadingBoxStyles, loadingTextStyles } from './LoadingStyles';

export interface LoadingProps {
  loadingText: string;
}

export function LoadingBox({ loadingText }: LoadingProps) {
  return (
    <Box testId="loading-box" sx={loadingBoxStyles}>
      <Icon
        testId="loading-icon"
        icon="Loading"
        sx={{
          w: 'base.icon.size.500',
          h: 'base.icon.size.500',
          fill: 'base.color.translucent.inverse.900',
          backgroundColor: 'base.color.translucent.standard.900',
          borderRadius: '50%',
          padding: '6px',
        }}
      />
      <Body testId="loading-text" sx={loadingTextStyles}>{loadingText}</Body>
    </Box>
  );
}
