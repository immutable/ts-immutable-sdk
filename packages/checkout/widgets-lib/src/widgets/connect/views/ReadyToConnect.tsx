import { Web3Provider } from '@ethersproject/providers';
import {
  ChainId,
  WalletProviderName,
} from '@imtbl/checkout-sdk';
import {
  useContext, useState, useCallback, useMemo, useEffect,
} from 'react';
import { addProviderListenersForWidgetRoot } from 'lib';
import { useTranslation } from 'react-i18next';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { FooterButton } from '../../../components/Footer/FooterButton';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { MetamaskConnectHero } from '../../../components/Hero/MetamaskConnectHero';
import { PassportConnectHero } from '../../../components/Hero/PassportConnectHero';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { ConnectWidgetViews } from '../../../context/view-context/ConnectViewContextTypes';
import { ConnectContext, ConnectActions } from '../context/ConnectContext';
import { ViewContext, ViewActions } from '../../../context/view-context/ViewContext';
import { isMetaMaskProvider, isPassportProvider } from '../../../lib/providerUtils';
import { UserJourney, useAnalytics } from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { identifyUser } from '../../../lib/analytics/identifyUser';

export interface ReadyToConnectProps {
  targetChainId: ChainId;
  allowedChains: ChainId[];
}
export function ReadyToConnect({ targetChainId, allowedChains }: ReadyToConnectProps) {
  const { t } = useTranslation();
  const {
    connectState: { checkout, provider, sendCloseEvent },
    connectDispatch,
  } = useContext(ConnectContext);
  const { viewState: { history }, viewDispatch } = useContext(ViewContext);

  const isPassport = isPassportProvider(provider);
  const isMetaMask = isMetaMaskProvider(provider);

  const { page, identify, track } = useAnalytics();

  useEffect(() => {
    page({
      userJourney: UserJourney.CONNECT,
      screen: 'ReadyToConnect',
    });
  }, []);

  // make sure wallet provider name is set if coming directly to this screen
  // and not through the wallet list
  useEffect(() => {
    if (isPassport) {
      connectDispatch({
        payload: {
          type: ConnectActions.SET_WALLET_PROVIDER_NAME,
          walletProviderName: WalletProviderName.PASSPORT,
        },
      });
    }
    if (isMetaMask) {
      connectDispatch({
        payload: {
          type: ConnectActions.SET_WALLET_PROVIDER_NAME,
          walletProviderName: WalletProviderName.METAMASK,
        },
      });
    }
  }, [isPassport, isMetaMask]);

  const textView = () => `views.READY_TO_CONNECT.${isPassport ? 'passport' : 'metamask'}`;
  const [footerButtonTextKey, setFooterButtonTextKey] = useState(`${textView()}.footer.buttonText1`);
  const [loading, setLoading] = useState(false);
  const heroContent = () => {
    if (isPassport) {
      return <PassportConnectHero />;
    }
    return <MetamaskConnectHero />;
  };

  const isConnectWidgetView = (view:string) => Object.values(ConnectWidgetViews).includes(view as ConnectWidgetViews);

  const showBackButton = useMemo(() => {
    if (history.length <= 1) return false;
    if (!isConnectWidgetView(history[history.length - 2].type)) return false;
    return true;
  }, [history]);

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const handleConnectViewUpdate = async (provider: Web3Provider) => {
    // Skip checks for Passport. Passport will be shipped with the
    // zkEVM network pre-configured and changes of networks are handled
    // by the ConnectLoader.
    // TODO: Remove this check when Passport has support for L1.
    if (!isPassport) {
      const chainId = await provider.getSigner().getChainId();
      if (chainId !== targetChainId && !allowedChains?.includes(chainId)) {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: { type: ConnectWidgetViews.SWITCH_NETWORK },
          },
        });
        return;
      }
    }

    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: { type: ConnectWidgetViews.SUCCESS },
      },
    });
  };

  const onConnectClick = useCallback(async () => {
    if (loading) return;
    if (!checkout) return;
    if (!provider) return;

    setLoading(true);

    try {
      track({
        userJourney: UserJourney.CONNECT,
        screen: 'ReadyToConnect',
        control: 'Connect',
        controlType: 'Button',
      });
      const connectResult = await checkout.connect({
        provider,
      });

      // Set up EIP-1193 provider event listeners for widget root instances
      addProviderListenersForWidgetRoot(connectResult.provider);

      await identifyUser(identify, connectResult.provider);

      connectDispatch({
        payload: {
          type: ConnectActions.SET_PROVIDER,
          provider: connectResult.provider,
        },
      });
      handleConnectViewUpdate(provider);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error(err);
      setLoading(false);
      setFooterButtonTextKey(`${textView()}.footer.buttonText2`);
    }
  }, [checkout, provider, connectDispatch, viewDispatch, identify]);

  return (
    <SimpleLayout
      testId="ready-to-connect"
      header={(
        <HeaderNavigation
          showBack={showBackButton}
          title={t('views.READY_TO_CONNECT.header.title')}
          transparent
          onCloseButtonClick={sendCloseEvent}
        />
      )}
      floatHeader
      heroContent={heroContent()}
      footer={(
        <FooterButton
          loading={loading}
          actionText={t(footerButtonTextKey)}
          onActionClick={onConnectClick}
        />
      )}
    >
      <SimpleTextBody heading={t(`${textView()}.body.heading`)}>{t(`${textView()}.body.content`)}</SimpleTextBody>
    </SimpleLayout>
  );
}
