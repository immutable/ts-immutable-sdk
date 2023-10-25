import { Web3Provider } from '@ethersproject/providers';
import { ChainId, Checkout, WalletProviderName } from '@imtbl/checkout-sdk';
import {
  useContext, useState, useCallback, useMemo, useEffect,
} from 'react';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { FooterButton } from '../../../components/Footer/FooterButton';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { MetamaskConnectHero } from '../../../components/Hero/MetamaskConnectHero';
import { PassportConnectHero } from '../../../components/Hero/PassportConnectHero';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { ConnectWidgetViews } from '../../../context/view-context/ConnectViewContextTypes';
import { text } from '../../../resources/text/textConfig';
import { ConnectContext, ConnectActions } from '../context/ConnectContext';
import {
  ViewContext,
  ViewActions,
} from '../../../context/view-context/ViewContext';
import { isMetaMaskProvider, isPassportProvider } from '../../../lib/providerUtils';
import { UserJourney } from '../../../context/analytics-provider/segmentAnalyticsConfig';
import { identifyUser } from '../../../lib/analytics/identifyUser';
import { useAnalytics } from '../../../context/analytics-provider/CustomAnalyticsProvider';

export interface ReadyToConnectProps {
  targetChainId: ChainId;
}
export function ReadyToConnect({ targetChainId }: ReadyToConnectProps) {
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

  const textView = () => {
    if (isPassport) {
      return text.views[ConnectWidgetViews.READY_TO_CONNECT].passport;
    }
    return text.views[ConnectWidgetViews.READY_TO_CONNECT].metamask;
  };
  const { header } = text.views[ConnectWidgetViews.READY_TO_CONNECT];
  const { body, footer } = textView();
  const [footerButtonText, setFooterButtonText] = useState(footer.buttonText1);
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

  const handleConnectViewUpdate = async (
    // TODO: variable is already declared above
    // eslint-disable-next-line
    checkout: Checkout,
    // eslint-disable-next-line
    provider: Web3Provider,
  ) => {
    const networkInfo = await checkout.getNetworkInfo({ provider });

    if (networkInfo.chainId !== targetChainId) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: ConnectWidgetViews.SWITCH_NETWORK },
        },
      });
      return;
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
    setLoading(true);
    if (checkout && provider) {
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
        await identifyUser(identify, connectResult.provider);

        connectDispatch({
          payload: {
            type: ConnectActions.SET_PROVIDER,
            provider: connectResult.provider,
          },
        });
        handleConnectViewUpdate(checkout, provider);
      } catch (err: any) {
        setLoading(false);
        setFooterButtonText(footer.buttonText2);
      }
    }
  }, [checkout, provider, connectDispatch, viewDispatch, footer.buttonText2, identify]);

  return (
    <SimpleLayout
      testId="ready-to-connect"
      header={(
        <HeaderNavigation
          showBack={showBackButton}
          title={header.title}
          transparent
          onCloseButtonClick={sendCloseEvent}
        />
      )}
      floatHeader
      heroContent={heroContent()}
      footer={(
        <FooterButton
          loading={loading}
          actionText={footerButtonText}
          onActionClick={onConnectClick}
        />
      )}
    >
      <SimpleTextBody heading={body.heading}>{body.content}</SimpleTextBody>
    </SimpleLayout>
  );
}
