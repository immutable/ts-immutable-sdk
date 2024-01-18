import { HeaderNavigation } from 'components/Header/HeaderNavigation';
import { SimpleLayout } from 'components/SimpleLayout/SimpleLayout';
import { FooterLogo } from 'components/Footer/FooterLogo';
import { useContext, useEffect, useMemo } from 'react';
import { EventTargetContext } from 'context/event-target-context/EventTargetContext';
import { BridgeWidgetViews } from 'context/view-context/BridgeViewContextTypes';
import { ButtonNavigationStyles } from 'components/Header/HeaderStyles';
import { ButtCon } from '@biom3/react';
import { SharedViews, ViewActions, ViewContext } from 'context/view-context/ViewContext';
import { UserJourney, useAnalytics } from 'context/analytics-provider/SegmentAnalyticsProvider';
import { useTranslation } from 'react-i18next';
import { sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';
import { WalletAndNetworkSelector } from '../components/WalletAndNetworkSelector';

export function WalletNetworkSelectionView() {
  const { t } = useTranslation();
  const { viewState, viewDispatch } = useContext(ViewContext);

  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const showBackButton = useMemo(() => viewState.history.length >= 2
      && viewState.history[viewState.history.length - 2].type
        === SharedViews.TOP_UP_VIEW, [viewState.history]);

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
          showBack={showBackButton}
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
              testId="settings-button"
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
