import {
  BottomSheet, Box,
  DUMMY_RASTER_IMAGE_URL,
  Heading,
  MenuItem,
} from '@biom3/react';

type FundingRouteDrawerProps = {
  visible: boolean;
  onCloseBottomSheet: (selectedFundingRouteIndex: number) => void;
  fundingRoutes: any;
  activeFundingRouteIndex: number;
};

export function FundingRouteDrawer({
  visible, onCloseBottomSheet, fundingRoutes, activeFundingRouteIndex,
}:
FundingRouteDrawerProps) {
  const onClickMenuItem = (selectedFundingRouteIndex: number) => {
    onCloseBottomSheet(selectedFundingRouteIndex);
  };

  return (
    <BottomSheet
      size="full"
      onCloseBottomSheet={() => onCloseBottomSheet(activeFundingRouteIndex)}
      visible={visible}
      showHeaderBar={false}
    >
      <BottomSheet.Content>
        <Box
          testId="not-enough-gas-bottom-sheet"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 'base.spacing.x6',
            paddingBottom: 'base.spacing.x1',
            height: '100%',
          }}
        >

          <Heading
            size="small"
            sx={{
              color: 'base.color.text.secondary',
              fontFamily: 'base.font.family.heading.secondary',
              textAlign: 'center',
              marginTop: 'base.spacing.x4',
            }}
            testId="not-enough-gas-heading"
          >
            Pay with
          </Heading>

          <Box sx={{
            d: 'flex',
            gap: 'base.spacing.x4',
            flexDirection: 'column',
          }}
          >
            {fundingRoutes.map((route: any, i: number) => (
              <MenuItem
                onClick={() => onClickMenuItem(i)}
                key={route.priority}
                selected={activeFundingRouteIndex === i}
              >
                <MenuItem.Badge variant="guidance" isAnimated />
                <MenuItem.IntentIcon icon="ChevronForward" />
                <MenuItem.FramedImage imageUrl={DUMMY_RASTER_IMAGE_URL} />
                <MenuItem.Label>
                  { route.steps[0].type }
                  {' '}
                  -
                  {' '}
                  { route.steps[0].asset.token.name}
                </MenuItem.Label>
                <MenuItem.Caption>
                  Some caption text
                </MenuItem.Caption>
              </MenuItem>

            ))}
          </Box>

        </Box>
      </BottomSheet.Content>
    </BottomSheet>
  );
}
