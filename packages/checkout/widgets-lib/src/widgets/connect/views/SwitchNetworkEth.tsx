import {
  useCallback, useContext, useEffect, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { getChainNameById } from 'lib/chains';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { FooterButton } from '../../../components/Footer/FooterButton';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { EthereumPlanetHero } from '../../../components/Hero/EthereumPlanetHero';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { ConnectWidgetViews } from '../../../context/view-context/ConnectViewContextTypes';
import { ConnectActions, ConnectContext } from '../context/ConnectContext';
import { getL1ChainId } from '../../../lib/networkUtils';
import {
  ViewContext,
  ViewActions,
} from '../../../context/view-context/ViewContext';
import { UserJourney, useAnalytics } from '../../../context/analytics-provider/SegmentAnalyticsProvider';

export function SwitchNetworkEth() {
  const { t } = useTranslation();
  const { viewDispatch } = useContext(ViewContext);
  const { connectDispatch, connectState } = useContext(ConnectContext);
  const { checkout, provider, sendCloseEvent } = connectState;
  const [buttonTextKey, setButtonTextKey] = useState(t('views.SWITCH_NETWORK.eth.button.text'));

  const { page, track } = useAnalytics();

  useEffect(() => {
    page({
      userJourney: UserJourney.CONNECT,
      screen: 'SwitchNetworkEth',
    });
  }, []);

  const switchNetwork = useCallback(async () => {
    if (!provider || !checkout) return;

    track({
      userJourney: UserJourney.CONNECT,
      screen: 'SwitchNetworkEth',
      control: 'Switch',
      controlType: 'Button',
    });
    try {
      const switchRes = await checkout.switchNetwork({
        provider,
        chainId: getL1ChainId(checkout.config),
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
      setButtonTextKey(t('views.SWITCH_NETWORK.eth.button.retryText'));
    }
  }, [provider, checkout, track]);

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
          actionText={t(buttonTextKey)}
          onActionClick={switchNetwork}
        />
      )}
      heroContent={<EthereumPlanetHero />}
      floatHeader
    >
      <SimpleTextBody
        heading={t('views.SWITCH_NETWORK.eth.heading', {
          networkName: getChainNameById(getL1ChainId(checkout!.config)),
        })}
      >
        {t('views.SWITCH_NETWORK.eth.body')}
      </SimpleTextBody>
    </SimpleLayout>
  );
}
