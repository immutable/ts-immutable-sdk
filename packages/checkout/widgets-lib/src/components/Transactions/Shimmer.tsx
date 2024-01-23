import { Box, MenuItem, ShimmerBox } from '@biom3/react';

export function Shimmer() {
  return (
    <>
      <ShimmerBox sx={{
        h: 'base.spacing.x4',
        w: 'base.spacing.x32',
        mb: 'base.spacing.x2',
        mt: 'base.spacing.x2',
      }}
      />
      <Box sx={{ mb: 'base.spacing.x5' }}><MenuItem shimmer emphasized size="small" /></Box>
      <Box sx={{ mb: 'base.spacing.x5' }}><MenuItem shimmer emphasized size="small" /></Box>
      <Box sx={{ mb: 'base.spacing.x5' }}><MenuItem shimmer emphasized size="small" /></Box>
    </>
  );
}
