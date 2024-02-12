import { MenuItem, ShimmerBox, Stack } from '@biom3/react';

export function Shimmer() {
  return (
    <Stack sx={{ gap: 'base.spacing.x2' }}>
      <ShimmerBox sx={{
        h: 'base.spacing.x4',
        w: 'base.spacing.x32',
        mt: 'base.spacing.x2',
      }}
      />
      <MenuItem shimmer emphasized size="small" />
      <MenuItem shimmer emphasized size="small" />
      <MenuItem shimmer emphasized size="small" />
    </Stack>
  );
}
