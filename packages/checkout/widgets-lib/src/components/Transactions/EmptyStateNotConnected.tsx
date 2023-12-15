import { Body, Box, Button } from '@biom3/react';
import { BridgeWidgetViews } from 'context/view-context/BridgeViewContextTypes';
import { text } from 'resources/text/textConfig';
import { containerStyle } from './EmptyStateNotConnectedStyles';

export function EmptyStateNotConnected() {
  const { status: { emptyState } } = text.views[BridgeWidgetViews.TRANSACTIONS];

  return (
    <Box sx={containerStyle}>
      <Body sx={{ mb: 'base.spacing.x8' }}>{emptyState.notConnected.body}</Body>
      <Button variant="secondary" size="medium">Connect</Button>
    </Box>
  );
}
