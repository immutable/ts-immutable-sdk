import {
  Box, Divider,
} from '@biom3/react';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import { text } from 'resources/text/textConfig';
import { TransactionInProgress } from './TransactionInProgress';

export function TransactionsInProgress() {
  const { status: { inProgress } } = text.views[XBridgeWidgetViews.TRANSACTIONS];

  return (
    <>
      <Divider size="xSmall">{inProgress.heading}</Divider>
      <Box sx={{ pt: 'base.spacing.x3', pb: 'base.spacing.x8' }}>
        {
        [1, 2].map((id) => (
          <TransactionInProgress key={id.toString()} />
        ))
      }
      </Box>
    </>
  );
}
