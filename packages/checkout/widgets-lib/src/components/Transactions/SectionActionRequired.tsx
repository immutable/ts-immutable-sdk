import { Box, Divider } from '@biom3/react';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import { text } from 'resources/text/textConfig';
import { TransactionClaim } from './TransactionClaim';
import { TransactionTopup } from './TransactionTopup';

export function TransactionsActionRequired() {
  const { status: { actionRequired } } = text.views[XBridgeWidgetViews.TRANSACTIONS];

  return (
    <>
      <Divider size="xSmall">{actionRequired.heading}</Divider>
      <Box sx={{
        pt: 'base.spacing.x3',
        pb: 'base.spacing.x8',
      }}
      >
        <TransactionClaim key="1" />
        <TransactionTopup key="2" />
      </Box>
    </>
  );
}
