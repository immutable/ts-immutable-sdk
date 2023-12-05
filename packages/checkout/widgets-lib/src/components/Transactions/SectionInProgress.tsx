import {
  Box, Divider,
} from '@biom3/react';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import { text } from 'resources/text/textConfig';
import { TransactionInProgress } from './TransactionInProgress';
import { containerStyles } from './sectionStyles';

export function TransactionsInProgress() {
  const { status: { inProgress } } = text.views[XBridgeWidgetViews.TRANSACTIONS];

  return (
    <>
      <Divider size="xSmall">{inProgress.heading}</Divider>
      <Box sx={containerStyles}>
        <TransactionInProgress key="1" />
      </Box>
    </>
  );
}
