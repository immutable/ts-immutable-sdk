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
  Box, ButtCon, Link, MenuItem, ShimmerBox,
} from '@biom3/react';
import { SharedViews, ViewActions, ViewContext } from 'context/view-context/ViewContext';
import { useInterval } from 'lib/hooks/useInterval';
import { isPassportProvider } from 'lib/providerUtils';
import { sendBridgeWidgetCloseEvent } from '../../widgets/x-bridge/BridgeWidgetEvents';
import { XBridgeContext } from '../../widgets/x-bridge/context/XBridgeContext';
import { TransactionsInProgress } from './SectionInProgress';
import { TransactionsActionRequired } from './SectionActionRequired';
import { Shimmer } from './Shimmer';
import { transactionsListStyle } from './indexStyles';

export function Transactions() {
  const { viewDispatch } = useContext(ViewContext);

  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);
  const { layoutHeading, passportDashboard } = text.views[XBridgeWidgetViews.TRANSACTIONS];

  const { bridgeState } = useContext(XBridgeContext);
  const { web3Provider } = bridgeState;

  const isPassport = true || isPassportProvider(web3Provider);

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
          sx={transactionsListStyle(isPassport)}
        >
          {loading ? <Shimmer /> : (
            <>
              <TransactionsActionRequired />
              <TransactionsInProgress />
            </>
          )}
        </Box>
        {isPassport && (
        <MenuItem emphasized>
          <MenuItem.Label sx={{ fontWeight: 'normal' }}>
            {passportDashboard}
            {' '}
            <Link
              size="small"
              rc={<a href="https://passport.immutable.com" />}
            >
              Passport
            </Link>
          </MenuItem.Label>
        </MenuItem>
        )}
      </Box>
    </SimpleLayout>
  );
}
