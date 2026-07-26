import { onLightBase } from '@biom3/design-tokens';
import { BiomeCombinedProviders, Box } from '@biom3/react';
import { Outlet } from 'react-router-dom';

export default function SdkLayout() {
  return (
    <BiomeCombinedProviders theme={{ base: onLightBase }}>
      <Box
        sx={{
          m: 'auto',
          padding: 'base.spacing.x10',
        }}
      >
        <Outlet />
      </Box>
    </BiomeCombinedProviders>
  );
}
