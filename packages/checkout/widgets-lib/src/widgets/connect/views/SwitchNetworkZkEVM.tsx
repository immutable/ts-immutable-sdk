import {
  useCallback, useContext, useEffect, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { FooterButton } from '../../../components/Footer/FooterButton';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { ConnectWidgetViews } from '../../../context/view-context/ConnectViewContextTypes';
import { ConnectActions, ConnectContext } from '../context/ConnectContext';
import { ViewContext, ViewActions } from '../../../context/view-context/ViewContext';
import { getL2ChainId } from '../../../lib';
import { ImmutablePlanetHero } from '../../../components/Hero/ImmutablePlanetHero';
import { UserJourney, useAnalytics } from '../../../context/analytics-provider/SegmentAnalyticsProvider';

export function SwitchNetworkZkEVM() {
  const { t } = useTranslation();
  const { viewDispatch } = useContext(ViewContext);
  const { connectDispatch, connectState } = useContext(ConnectContext);
  const { checkout, provider, sendCloseEvent } = connectState;
  const [buttonTextKey, setButtonTextKey] = useState('views.SWITCH_NETWORK.zkEVM.button.text');
  const { page, track } = useAnalytics();

  useEffect(() => {
    page({
      userJourney: UserJourney.CONNECT,
      screen: 'SwitchNetworkZkEVM',
    });
  }, []);

  const switchNetwork = useCallback(async () => {
    if (!provider || !checkout) return;

    track({
      userJourney: UserJourney.CONNECT,
      screen: 'SwitchNetworkZkEVM',
      control: 'Switch',
      controlType: 'Button',
    });

    try {
      const switchRes = await checkout.switchNetwork({
        provider,
        chainId: getL2ChainId(checkout.config),
      });
      connectDispatch({
        payload: {
          type: ConnectActions.SET_PROVIDER,
          provider: switchRes.provider,
        },
      });

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: ConnectWidgetViews.SUCCESS,
          },
        },
      });
    } catch (err: any) {
      setButtonTextKey('views.SWITCH_NETWORK.zkEVM.button.retryText');
    }
  }, [provider, checkout]);

  return (
    <SimpleLayout
      testId="switch-network-view"
      header={(
        <HeaderNavigation
          transparent
          onCloseButtonClick={sendCloseEvent}
        />
      )}
      footer={(
        <FooterButton
          actionText={buttonTextKey}
          onActionClick={switchNetwork}
        />
      )}
      heroContent={<ImmutablePlanetHero />}
      floatHeader
    >
      <SimpleTextBody
        heading={t('views.SWITCH_NETWORK.zkEVM.heading')}
      >
        {t('views.SWITCH_NETWORK.zkEVM.body')}
      </SimpleTextBody>
    </SimpleLayout>
  );
}
