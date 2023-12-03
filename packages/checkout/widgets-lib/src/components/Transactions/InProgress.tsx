import {
  Box, Divider, Icon, MenuItem,
} from '@biom3/react';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import { text } from 'resources/text/textConfig';

export function TransactionsInProgress() {
  const { status: { inProgress } } = text.views[XBridgeWidgetViews.TRANSACTIONS];

  return (
    <>
      <Divider size="xSmall">{inProgress.heading}</Divider>
      <Box sx={{ pt: 'base.spacing.x3', pb: 'base.spacing.x8' }}>
        {
        [1, 2].map((id) => (
          <Box sx={{ position: 'relative' }}>
            <MenuItem key={id} emphasized size="small" sx={{ mt: 'base.spacing.x1' }}>
              <MenuItem.FramedIcon icon="Coins" circularFrame />
              <MenuItem.Label>
                zkTKN
              </MenuItem.Label>
              <MenuItem.Caption>
                Zero Knowledge Token
              </MenuItem.Caption>
              <MenuItem.PriceDisplay
                fiatAmount="USD $12345.12"
                price="1835.1234"
              />
            </MenuItem>
            <Icon
              sx={{
                position: 'absolute',
                top: 'base.spacing.x3',
                left: 'base.spacing.x12',
                w: 'base.icon.size.200',
                p: 'base.spacing.x1',
                fill: '#0F0F0F',
                bg: 'base.color.brand.1',
                borderRadius: '100%',
              }}
              icon="Minting"
              variant="bold"
            />
          </Box>
        ))
      }
      </Box>
    </>
  );
}
