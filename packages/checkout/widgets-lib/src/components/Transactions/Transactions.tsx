import {
  useContext, useEffect,
} from 'react';
import { Box } from '@biom3/react';

import { useTranslation } from 'react-i18next';
import { HeaderNavigation } from '../Header/HeaderNavigation';
import { SimpleLayout } from '../SimpleLayout/SimpleLayout';
import { FooterLogo } from '../Footer/FooterLogo';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import {
  isPassportProvider,
} from '../../lib/provider';
import {
  UserJourney,
  useAnalytics,
} from '../../context/analytics-provider/SegmentAnalyticsProvider';
import {
  BridgeActions,
  BridgeContext,
} from '../../widgets/bridge/context/BridgeContext';
import { sendBridgeWidgetCloseEvent } from '../../widgets/bridge/BridgeWidgetEvents';
import {
  supportBoxContainerStyle,
  transactionsContainerStyle,
} from './TransactionsStyles';
import { SupportMessage } from './SupportMessage';

type TransactionsProps = {
  onBackButtonClick: () => void;
};

export function Transactions({
  onBackButtonClick,
}: TransactionsProps) {
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const {
    bridgeDispatch,
    bridgeState: { checkout, from },
  } = useContext(BridgeContext);
  const { page } = useAnalytics();
  const { t } = useTranslation();

  const isPassport = isPassportProvider(from?.browserProvider);

  const handleBackButtonClick = () => {
    if (from) {
      bridgeDispatch({
        payload: {
          type: BridgeActions.SET_WALLETS_AND_NETWORKS,
          from: {
            browserProvider: from?.browserProvider,
            walletAddress: from?.walletAddress,
            walletProviderInfo: from?.walletProviderInfo,
            network: from?.network,
          },
          to: null,
        },
      });
      bridgeDispatch({
        payload: {
          type: BridgeActions.SET_TOKEN_AND_AMOUNT,
          token: null,
          amount: '',
        },
      });
    }

    onBackButtonClick();
  };

  useEffect(() => {
    page({
      userJourney: UserJourney.BRIDGE,
      screen: 'Transactions',
    });
  }, []);

  return (
    <SimpleLayout
      testId="bridge-view"
      header={(
        <HeaderNavigation
          showBack
          onBackButtonClick={handleBackButtonClick}
          title={t('views.TRANSACTIONS.layoutHeading')}
          onCloseButtonClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
        />
      )}
      footer={<FooterLogo />}
    >
      <Box sx={transactionsContainerStyle}>
        <Box sx={supportBoxContainerStyle}>
          <SupportMessage checkout={checkout} isPassport={isPassport} />
        </Box>
      </Box>
    </SimpleLayout>
  );
}
