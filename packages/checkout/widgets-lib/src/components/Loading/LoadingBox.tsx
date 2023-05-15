import { Body, Box, Icon } from '@biom3/react';
import { LoadingBoxStyles } from './LoadingStyles';

export interface LoadingProps {
  loadingText: string;
}

export const LoadingBox = ({ loadingText }: LoadingProps) => {
  return (
    <Box testId="loading-box" sx={LoadingBoxStyles}>
      <Icon
        testId="loading-icon"
        icon="Loading"
        sx={{ w: 'base.icon.size.500' }}
      />
      <Body testId="loading-text">{loadingText}</Body>
    </Box>
  );
};
