import {
  Badge,
  Body, Box, Button, MenuItem,
} from '@biom3/react';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import { text } from 'resources/text/textConfig';

export function TransactionClaim({ key }: { key: string }) {
  const { status: { claim } } = text.views[XBridgeWidgetViews.TRANSACTIONS];

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
        <MenuItem.Caption>{claim.stepInfo}</MenuItem.Caption>
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
        <Body size="xSmall" sx={{ flexGrow: '1' }}>{claim.banner.heading}</Body>
        <Button variant="secondary" size="small">{claim.action}</Button>
      </Box>
    </Box>
  );
}
