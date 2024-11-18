import {
  useCallback, useContext, useEffect, useState,
} from 'react';
import { BrowserProvider } from 'ethers';
import { useTranslation } from 'react-i18next';
import { isWalletConnectProvider } from '../../../lib/provider';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { FooterButton } from '../../../components/Footer/FooterButton';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { ConnectWidgetViews } from '../../../context/view-context/ConnectViewContextTypes';
import { ConnectActions, ConnectContext } from '../context/ConnectContext';
import { ViewContext, ViewActions } from '../../../context/view-context/ViewContext';
import { addChainChangedListener, getL2ChainId, removeChainChangedListener } from '../../../lib';
import { ImmutablePlanetHero } from '../../../components/Hero/ImmutablePlanetHero';
import { UserJourney, useAnalytics } from '../../../context/analytics-provider/SegmentAnalyticsProvider';

export function SwitchNetworkZkEVM() {
  const { t } = useTranslation();
  const { viewDispatch } = useContext(ViewContext);
  const { connectDispatch, connectState } = useContext(ConnectContext);
  const { checkout, provider, sendCloseEvent } = connectState;
  const [buttonTextKey, setButtonTextKey] = useState(t('views.SWITCH_NETWORK.zkEVM.button.text'));
  const { page, track } = useAnalytics();

  useEffect(() => {
    page({
      userJourney: UserJourney.CONNECT,
      screen: 'SwitchNetworkZkEVM',
    });
  }, []);

  useEffect(() => {
    if (!provider || !checkout) return;

    const checkCorrectNetwork = async () => {
      const currentChainId = await provider.send!('eth_chainId', []);
      // eslint-disable-next-line radix
      const parsedChainId = parseInt(currentChainId.toString());
      if (parsedChainId === getL2ChainId(checkout.config)) {
        connectDispatch({
          payload: {
            type: ConnectActions.SET_PROVIDER,
            // @ts-expect-error TODO
            provider: new BrowserProvider(provider.provider as any),
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
      }
    };

    addChainChangedListener(provider, checkCorrectNetwork);

    // eslint-disable-next-line consistent-return
    return () => {
      removeChainChangedListener(provider, checkCorrectNetwork);
    };
  }, [checkout, provider]);

  const switchNetwork = useCallback(async () => {
    if (!provider || !checkout) return;

    track({
      userJourney: UserJourney.CONNECT,
      screen: 'SwitchNetworkZkEVM',
      control: 'Switch',
      controlType: 'Button',
    });

    if (!provider.send) return;

    const currentChainId = provider.send('eth_chainId', []);
    // eslint-disable-next-line radix
    const parsedChainId = parseInt(currentChainId.toString());

    if (parsedChainId === getL2ChainId(checkout.config)) {
      connectDispatch({
        payload: {
          type: ConnectActions.SET_PROVIDER,
          provider,
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

      return;
    }

    try {
      let walletName = '';
      if (isWalletConnectProvider(provider.name)) {
        walletName = (provider.provider as any)?.session?.peer?.metadata?.name.toLowerCase();
      }
      if (walletName.includes('metamask')) {
        try {
          await checkout.addNetwork({
            provider,
            chainId: getL2ChainId(checkout.config),
          });
          connectDispatch({
            payload: {
              type: ConnectActions.SET_PROVIDER,
              provider,
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
          return;
        } catch {
          // eslint-disable-next-line no-console
          console.warn('Failed to add network to wallet, skipping add network');
        }
      }

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
      setButtonTextKey(t('views.SWITCH_NETWORK.zkEVM.button.retryText'));
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
        {isWalletConnectProvider(provider?.name) ? (
          t('views.SWITCH_NETWORK.zkEVM.bodyWalletConnect')) : (
          t('views.SWITCH_NETWORK.zkEVM.body'))}
      </SimpleTextBody>
    </SimpleLayout>
  );
}
