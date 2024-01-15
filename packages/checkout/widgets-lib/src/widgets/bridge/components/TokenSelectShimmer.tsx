import { Box, ShimmerBox } from '@biom3/react';

export type TokenSelectShimmerProps = {
  sx?: {},
};

export function TokenSelectShimmer({ sx }: TokenSelectShimmerProps) {
  return (
    <Box
      sx={{
        ...sx,
        paddingTop: '0',
        marginTop: 'base.spacing.x4',
      }}
      rc={<div />}
    >
      <Box
        sx={{
          display: 'flex',
          backgroundColor: '#F3F3F30A',
          borderRadius: '8px',
        }}
      >
        <Box
          sx={{
            minw: '170px',
            height: '64px',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            WebkitMaskPosition: 'left center',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            WebkitMaskRepeat: 'no-repeat',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            WebkitMaskSize: 'contain',
            // eslint-disable-next-line @typescript-eslint/naming-convention,max-len
            WebkitMaskImage: 'url(\'data:image/svg+xml;utf8, <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M154.75 39q1.65 0 2.85-1.15 1.15-1.15 1.15-2.85v-4q0-1.65-1.15-2.8-1.2-1.2-2.85-1.2h-93.6q-2.3 0-3.85 1.2-1.55 1.15-1.55 2.8v4q0 1.7 1.55 2.85Q58.85 39 61.15 39h93.6m-111.7-3.35q.2-1.3.2-2.65 0-1.35-.2-2.65-.75-4.9-4.5-8.65-4.7-4.7-11.3-4.7-6.65 0-11.3 4.7-4.7 4.7-4.7 11.3 0 6.65 4.7 11.3Q20.6 49 27.25 49q6.6 0 11.3-4.7 3.75-3.7 4.5-8.65Z" id="a"/></svg>\')',
          }}
          rc={<span />}
        >
          {/* <MenuItem shimmer emphasized testId="balance-item-shimmer--1" /> */}
          <ShimmerBox
            rc={<span />}
          />
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          backgroundColor: '#F3F3F30A',
          borderRadius: '8px',
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '64px',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            WebkitMaskPosition: 'right center',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            WebkitMaskRepeat: 'no-repeat',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            WebkitMaskSize: 'contain',
            // eslint-disable-next-line @typescript-eslint/naming-convention,max-len
            WebkitMaskImage: 'url(\'data:image/svg+xml;utf8, <svg xmlns="http://www.w3.org/2000/svg" width="196" height="96"><path d="M182.85 55.2Q181.65 54 180 54h-56q-1.7 0-2.85 1.2Q120 56.35 120 58v4q0 1.7 1.15 2.85Q122.3 66 124 66h56q1.65 0 2.85-1.15Q184 63.7 184 62v-4q0-1.65-1.15-2.8m0-22Q181.65 32 180 32H68q-1.7 0-2.85 1.2Q64 34.35 64 36v8q0 1.7 1.15 2.85Q66.3 48 68 48h112q1.65 0 2.85-1.15Q184 45.7 184 44v-8q0-1.65-1.15-2.8Z" id="a"/></svg>\')',
          }}
          rc={<span />}
        >
          <ShimmerBox
            rc={<span />}
          />
        </Box>
      </Box>
    </Box>
  );
}
