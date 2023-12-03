/* eslint-disable @typescript-eslint/no-unused-vars */
import { HeaderNavigation } from 'components/Header/HeaderNavigation';
import { SimpleLayout } from 'components/SimpleLayout/SimpleLayout';
import { FooterLogo } from 'components/Footer/FooterLogo';
import { useContext, useState } from 'react';
import { EventTargetContext } from 'context/event-target-context/EventTargetContext';
import { text } from 'resources/text/textConfig';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import { ButtonNavigationStyles } from 'components/Header/HeaderStyles';
import {
  Box, ButtCon, MenuItem, ShimmerBox,
} from '@biom3/react';
import { SharedViews, ViewActions, ViewContext } from 'context/view-context/ViewContext';
import { useInterval } from 'lib/hooks/useInterval';
import { sendBridgeWidgetCloseEvent } from '../../widgets/x-bridge/BridgeWidgetEvents';
import { XBridgeContext } from '../../widgets/x-bridge/context/XBridgeContext';
import { TransactionsInProgress } from './InProgress';
import { TransactionsFinished } from './Finished';
import { TransactionsActionRequired } from './ActionRequired';
import { Shimmer } from './Shimmer';

export function Transactions() {
  const { viewDispatch } = useContext(ViewContext);

  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);
  const { layoutHeading } = text.views[XBridgeWidgetViews.TRANSACTIONS];

  const { bridgeState } = useContext(XBridgeContext);
  const { web3Provider } = bridgeState;

  const [loading, setLoading] = useState(true);

  // Simulate loading
  setTimeout(() => setLoading(false), 1000);

  return (
    <SimpleLayout
      testId="bridge-view"
      header={(
        <HeaderNavigation
          showBack
          title={layoutHeading}
          onCloseButtonClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
        />
      )}
      footer={<FooterLogo />}
    >
      <Box sx={{ px: 'base.spacing.x4' }}>
        <Box
          sx={{
            backgroundColor: 'base.color.neutral.800',
            px: 'base.spacing.x4',
            pt: 'base.spacing.x5',
            borderRadius: 'base.borderRadius.x6',
            h: '486px',
            overflowY: 'scroll',
          }}
        >
          {
            loading
              ? <Shimmer />
              : (
                <>
                  <TransactionsActionRequired />
                  <TransactionsInProgress />
                  <TransactionsFinished />
                </>
              )
}
        </Box>
      </Box>
    </SimpleLayout>
  );
}
