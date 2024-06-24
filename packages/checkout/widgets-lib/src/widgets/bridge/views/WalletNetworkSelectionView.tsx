import { useContext, useEffect } from 'react';
import { ButtCon } from '@biom3/react';
import { useTranslation } from 'react-i18next';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { BridgeWidgetViews } from '../../../context/view-context/BridgeViewContextTypes';
import { ButtonNavigationStyles } from '../../../components/Header/HeaderStyles';
import { ViewActions, ViewContext } from '../../../context/view-context/ViewContext';
import { UserJourney, useAnalytics } from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';
import { WalletAndNetworkSelector } from '../components/WalletAndNetworkSelector';

export function WalletNetworkSelectionView() {
  const { t } = useTranslation();
  const { viewDispatch } = useContext(ViewContext);

  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const { page } = useAnalytics();

  useEffect(() => {
    page({
      userJourney: UserJourney.BRIDGE,
      screen: 'WalletNetworkSelection',
    });
  }, []);

  return (
    <SimpleLayout
      testId="bridge-view"
      header={(
        <HeaderNavigation
          title={t('views.WALLET_NETWORK_SELECTION.layoutHeading')}
          onCloseButtonClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
          rightActions={(
            <ButtCon
              icon="Minting"
              sx={ButtonNavigationStyles()}
              onClick={() => {
                viewDispatch({
                  payload: {
                    type: ViewActions.UPDATE_VIEW,
                    view: { type: BridgeWidgetViews.TRANSACTIONS },
                  },
                });
              }}
              testId="move-transactions-button"
            />
          )}
        />
      )}
      footer={<FooterLogo />}
    >
      <WalletAndNetworkSelector />
    </SimpleLayout>
  );
}
