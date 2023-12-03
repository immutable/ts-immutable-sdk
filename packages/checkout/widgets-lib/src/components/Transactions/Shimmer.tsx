import {
  Box, MenuItem, ShimmerBox,
} from '@biom3/react';

export function Shimmer() {
  return (
    <>
      <ShimmerBox sx={{
        h: 'base.spacing.x4',
        w: 'base.spacing.x32',
        mb: 'base.spacing.x1',
      }}
      />
      <Box sx={{ mb: 'base.spacing.x1' }}><MenuItem shimmer emphasized size="small" /></Box>
      <Box sx={{ mb: 'base.spacing.x1' }}><MenuItem shimmer emphasized size="small" /></Box>
      <ShimmerBox sx={{
        h: 'base.spacing.x4',
        w: 'base.spacing.x32',
        mb: 'base.spacing.x1',
        mt: 'base.spacing.x8',
      }}
      />
      <Box sx={{ mb: 'base.spacing.x1' }}><MenuItem shimmer emphasized size="small" /></Box>
      <Box sx={{ mb: 'base.spacing.x1' }}><MenuItem shimmer emphasized size="small" /></Box>
    </>
  );
}
