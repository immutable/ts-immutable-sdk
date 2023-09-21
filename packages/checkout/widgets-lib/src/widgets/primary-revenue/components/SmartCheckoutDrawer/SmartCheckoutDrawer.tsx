import {
  BottomSheet, Box,
  Heading,
  IMX_TOKEN_IMAGE_URL,
  MenuItem,
  DUMMY_RASTER_IMAGE_URL,
} from '@biom3/react';
import {
  containerStyles,
  contentTextStyles,
} from './SmartCheckoutDrawerStyles';

type SmartCheckoutDrawerProps = {
  visible: boolean;
  onCloseBottomSheet?: () => void;
};

export function SmartCheckoutDrawer({ visible, onCloseBottomSheet }: SmartCheckoutDrawerProps) {
  return (
    <BottomSheet
      size="full"
      onCloseBottomSheet={onCloseBottomSheet}
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
            <MenuItem onClick={() => ({})}>
              <MenuItem.Badge variant="guidance" isAnimated />
              <MenuItem.IntentIcon icon="ChevronForward" />
              <MenuItem.FramedImage imageUrl={DUMMY_RASTER_IMAGE_URL} />
              <MenuItem.Label rc={<span contentEditable />}>
                Some label text 1
              </MenuItem.Label>
              <MenuItem.Caption rc={<span contentEditable />}>
                Some caption text
              </MenuItem.Caption>
            </MenuItem>
            <MenuItem>
              <MenuItem.IntentIcon />
              <MenuItem.Label rc={<span contentEditable />}>
                Some label text 1
              </MenuItem.Label>
              <MenuItem.Caption rc={<span contentEditable />}>
                Some caption text
              </MenuItem.Caption>
              <MenuItem.PriceDisplay
                fiatAmount="USD $12345.12"
                price="1835.1234"
                currencyImageUrl={IMX_TOKEN_IMAGE_URL}
              />

            </MenuItem>
          </Box>

        </Box>
      </BottomSheet.Content>
    </BottomSheet>
  );
}
