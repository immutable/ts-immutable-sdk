import {
  Badge,
  Box, Icon, MenuItem,
} from '@biom3/react';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import { text } from 'resources/text/textConfig';

export function TransactionTopup({ key }: { key: string }) {
  const { status: { actionRequired } } = text.views[XBridgeWidgetViews.TRANSACTIONS];

  return (
    <Box sx={{ position: 'relative' }}>
      <MenuItem key={key} emphasized size="small" sx={{ mt: 'base.spacing.x1' }}>
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
        <MenuItem.OverflowPopoverMenu>
          <MenuItem onClick={() => alert('item 1 clicked')}>
            <MenuItem.Label>
              {actionRequired.topup}
            </MenuItem.Label>
          </MenuItem>
        </MenuItem.OverflowPopoverMenu>
      </MenuItem>
      <Icon
        sx={{
          position: 'absolute',
          top: 'base.spacing.x3',
          left: 'base.spacing.x12',
          w: 'base.icon.size.200',
          fill: '#0F0F0F',
          bg: 'base.color.status.fatal.bright',
          borderRadius: '100%',
        }}
        icon="Exclamation"
      />
      <Badge
        sx={{
          position: 'absolute',
          top: 'base.spacing.x5',
          right: 'base.spacing.x2',
        }}
        isAnimated
        variant="fatal"
      />
    </Box>
  );
}
