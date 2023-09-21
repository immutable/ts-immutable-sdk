import {
  BottomSheet, Box,
  DUMMY_RASTER_IMAGE_URL,
  Heading,
  MenuItem,
} from '@biom3/react';
import {
  containerStyles,
  contentTextStyles,
} from './SmartCheckoutDrawerStyles';

type SmartCheckoutDrawerProps = {
  visible: boolean;
  onCloseBottomSheet: (selectedFundingRouteIndex: number) => void;
  fundingRoutes: any;
  activeFundingRouteIndex: number;
};

export function SmartCheckoutDrawer({
  visible, onCloseBottomSheet, fundingRoutes, activeFundingRouteIndex,
}:
SmartCheckoutDrawerProps) {
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
        <Box testId="not-enough-gas-bottom-sheet" sx={containerStyles}>

          <Heading
            size="small"
            sx={contentTextStyles}
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
