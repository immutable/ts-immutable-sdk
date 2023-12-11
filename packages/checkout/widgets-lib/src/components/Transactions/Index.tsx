import { HeaderNavigation } from 'components/Header/HeaderNavigation';
import { SimpleLayout } from 'components/SimpleLayout/SimpleLayout';
import { FooterLogo } from 'components/Footer/FooterLogo';
import { useContext, useMemo, useState } from 'react';
import { EventTargetContext } from 'context/event-target-context/EventTargetContext';
import { text } from 'resources/text/textConfig';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import { Box, Link, MenuItem } from '@biom3/react';
import { isPassportProvider } from 'lib/providerUtils';
import { Web3Provider } from '@ethersproject/providers';
import { sendBridgeWidgetCloseEvent } from '../../widgets/x-bridge/BridgeWidgetEvents';
import { XBridgeContext } from '../../widgets/x-bridge/context/XBridgeContext';
import { TransactionsInProgress } from './SectionInProgress';
import { Shimmer } from './Shimmer';
import { transactionsListStyle } from './indexStyles';
import { EmptyStateNotConnected } from './EmptyStateNotConnected';

type TransactionsProps = {
  globalWeb3Provider: Web3Provider | undefined
};

export function Transactions({ globalWeb3Provider }: TransactionsProps) {
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);
  const { bridgeState: { web3Provider } } = useContext(XBridgeContext);

  const { layoutHeading, passportDashboard } = text.views[XBridgeWidgetViews.TRANSACTIONS];

  const [loading, setLoading] = useState(false);

  const providerForTransactions = useMemo(
    () => web3Provider ?? globalWeb3Provider,
    [web3Provider, globalWeb3Provider],
  );

  const isPassport = isPassportProvider(providerForTransactions);

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
        {
          !providerForTransactions
            ? <EmptyStateNotConnected />
            : (
              <Box sx={transactionsListStyle(isPassport)}>
                {loading ? <Shimmer /> : (
                  <>
                    {/* <TransactionsActionRequired /> */}
                    <TransactionsInProgress />
                  </>
                )}
              </Box>
            )
        }
        {isPassport && (
        <MenuItem emphasized>
          <MenuItem.Label sx={{ fontWeight: 'normal' }}>
            {passportDashboard}
            {' '}
            <Link size="small" rc={<a href="https://passport.immutable.com" />}>
              Passport
            </Link>
          </MenuItem.Label>
        </MenuItem>
        )}
      </Box>
    </SimpleLayout>
  );
}
