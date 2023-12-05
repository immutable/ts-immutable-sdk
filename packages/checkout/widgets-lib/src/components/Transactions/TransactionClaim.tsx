import {
  Badge,
  Body,
  Box,
  Button,
  Divider,
  MenuItem,
} from '@biom3/react';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import { text } from 'resources/text/textConfig';
import {
  actionsBadgeStyles, actionsContainerStyles, actionsLayoutStyles, containerStyles,
} from './transactionStyles';

export function TransactionClaim({ key }: { key: string }) {
  const { status: { claim } } = text.views[XBridgeWidgetViews.TRANSACTIONS];

  return (
    <Box sx={containerStyles}>
      <MenuItem key={key} size="small">
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
      <Divider size="xSmall" sx={{ mt: 'base.spacing.x2' }} />
      <Box sx={actionsContainerStyles}>
        <Box sx={actionsLayoutStyles}>
          <Body size="xSmall" sx={{ color: 'base.color.text.secondary' }}>
            {claim.banner.heading}
          </Body>
        </Box>
        <Button variant="primary" size="small">{claim.action}</Button>
        <Badge
          isAnimated
          variant="fatal"
          sx={actionsBadgeStyles}
        />
      </Box>
    </Box>
  );
}
