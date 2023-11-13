import { Web3Provider } from '@ethersproject/providers';
import {
  ChainId,
  WalletProviderName,
} from '@imtbl/checkout-sdk';
import {
  useContext, useState, useCallback, useMemo, useEffect,
} from 'react';
import { addProviderListenersForWidgetRoot } from 'lib/eip1193Events';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { FooterButton } from '../../../components/Footer/FooterButton';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { MetamaskConnectHero } from '../../../components/Hero/MetamaskConnectHero';
import { PassportConnectHero } from '../../../components/Hero/PassportConnectHero';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { ConnectWidgetViews } from '../../../context/view-context/ConnectViewContextTypes';
import { text } from '../../../resources/text/textConfig';
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

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const handleConnectViewUpdate = async (provider: Web3Provider) => {
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
      setLoading(false);
      setFooterButtonText(footer.buttonText2);
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
