import {
  Badge, Body, Box, Button, MenuItem,
} from '@biom3/react';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import { text } from 'resources/text/textConfig';

export function TransactionTopup({ key }: { key: string }) {
  const { status: { topup } } = text.views[XBridgeWidgetViews.TRANSACTIONS];

  return (
    <Box sx={{
      px: 'base.spacing.x2',
      pt: 'base.spacing.x1',
      bg: 'base.color.neutral.700',
      borderRadius: 'base.borderRadius.x8',
      mt: 'base.spacing.x1',
    }}
    >
      <MenuItem key={key} emphasized size="small" sx={{ mt: 'base.spacing.x1' }}>
        <MenuItem.FramedIcon icon="Coins" circularFrame />
        <MenuItem.Label>
          zkTKN
        </MenuItem.Label>
        <MenuItem.Caption>{topup.stepInfo}</MenuItem.Caption>
        <MenuItem.PriceDisplay
          fiatAmount="USD $12345.12"
          price="-1835.1234"
        />
      </MenuItem>
      <Box sx={{
        py: 'base.spacing.x4',
        px: 'base.spacing.x1',
        d: 'flex',
        position: 'relative',
      }}
      >
        <Badge
          isAnimated
          variant="attention"
          sx={{
            position: 'absolute',
            right: '0',
            top: 'base.spacing.x2',
          }}
        />
        <Box sx={{ flexDirection: 'column', display: 'flex', flexGrow: '1' }}>
          <Body
            size="xSmall"
            sx={{ fontWeight: 'base.text.body.small.bold.fontWeight' }}
          >
            {topup.banner.heading}
          </Body>
          <Body size="xSmall">{topup.banner.body}</Body>
        </Box>
        <Button variant="secondary" size="small">{topup.action}</Button>
      </Box>
    </Box>
  );
}
