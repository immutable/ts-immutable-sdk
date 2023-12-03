import {
  Banner,
  Box, Divider,
} from '@biom3/react';
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
        <Banner
          variant="attention"
          sx={{
            mt: 'base.spacing.x1',
            rowGap: 'none',
          }}
        >
          <Banner.Title sx={{
            fontWeight: 'base.text.body.large.regular.fontWeight',
          }}
          >
            {actionRequired.claimBanner}
          </Banner.Title>
        </Banner>
        <TransactionClaim key="1" />
        <Banner
          variant="fatal"
          sx={{
            mt: 'base.spacing.x1',
            rowGap: 'none',
          }}
        >
          <Banner.Title sx={{ fontWeight: 'base.text.body.large.regular.fontWeight' }}>
            {actionRequired.toptupBanner}
          </Banner.Title>
        </Banner>
        <TransactionTopup key="2" />
      </Box>
    </>
  );
}
