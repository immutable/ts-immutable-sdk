import { BiomeCombinedProviders } from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import {
  useContext, useEffect, useMemo, useReducer, useState,
} from 'react';
import { IMTBLWidgetEvents } from '@imtbl/checkout-widgets';
import { Passport, UserProfile } from '@imtbl/passport';
import { WidgetTheme } from '../../lib';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import {
  SharedViews,
  ViewActions, ViewContext, initialViewState, viewReducer,
} from '../../context/view-context/ViewContext';
import { OnRampWidgetViews } from '../../context/view-context/OnRampViewContextTypes';
import { LoadingView } from '../../views/loading/LoadingView';
import { text } from '../../resources/text/textConfig';
import { ConnectLoaderContext } from '../../context/connect-loader-context/ConnectLoaderContext';
import { TopUpView } from '../../views/top-up/TopUpView';
import { sendOnRampWidgetCloseEvent } from './OnRampWidgetEvents';
import { OnRampMain } from './views/OnRampMain';
import { StatusType } from '../../components/Status/StatusType';
import { StatusView } from '../../components/Status/StatusView';
import {
  AnalyticsControls,
  useAnalytics,
  UserJourney,
} from '../../context/analytics-provider/SegmentAnalyticsProvider';
import { isPassportProvider } from '../../lib/providerUtils';

const LOADING_VIEW_DELAY_MS = 1000;
export interface OnRampWidgetProps {
  // eslint-disable-next-line react/no-unused-prop-types
  params: OnRampWidgetParams;
  config: StrongCheckoutWidgetsConfig;
}

export interface OnRampWidgetParams {
  amount?: string;
  contractAddress?: string;
  passport?: Passport;
}

export function OnRampWidget(props: OnRampWidgetProps) {
  const { config, params } = props;
  const { passport } = params;
  const {
    environment, theme, isOnRampEnabled, isSwapEnabled, isBridgeEnabled,
  } = config;
  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const viewReducerValues = useMemo(() => ({ viewState, viewDispatch }), [viewState, viewReducer]);

  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;
  const [walletAddress, setWalletAddress] = useState('');
  const [isPassport, setIsPassport] = useState(false);
  const [emailAddress, setEmailAddress] = useState<string | undefined>(undefined);

  const biomeTheme: BaseTokens = theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;

  const { initialLoadingText } = text.views[OnRampWidgetViews.ONRAMP];

  const showIframe = useMemo(
    () => viewState.view.type === OnRampWidgetViews.ONRAMP,
    [viewState.view.type],
  );

  const { track } = useAnalytics();

  useEffect(() => {
    const setDataFromProvider = async () => {
      if (!provider) return;
      const userWalletAddress = await provider.getSigner().getAddress();
      setWalletAddress(userWalletAddress);
      const isPassportUser = isPassportProvider(provider);
      setIsPassport(isPassportUser);
      let userInfo:UserProfile | undefined;
      if (isPassportUser && passport) {
        userInfo = await passport.getUserInfo();
        setEmailAddress(userInfo?.email);
      }

      track({
        userJourney: UserJourney.ON_RAMP,
        screen: 'Onramp-widget-load',
        control: AnalyticsControls.WIDGET_INITIALISATION,
        controlType: 'WidgetLoad',
        action: 'Opened',
        userId: userWalletAddress,
        isPassportWallet: isPassportUser,
        email: userInfo?.email,
      });
    };
    setDataFromProvider();
  }, [provider]);

  useEffect(() => {
    if (!checkout || !provider) return;
    (async () => {
      const network = await checkout.getNetworkInfo({
        provider,
      });

      /* If the provider's network is not supported, return out of this and let the
    connect loader handle the switch network functionality */
      if (!network.isSupported) {
        return;
      }
      setTimeout(() => {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: { type: OnRampWidgetViews.ONRAMP },
          },
        });
      }, LOADING_VIEW_DELAY_MS);
    })();
  }, [checkout, provider, viewDispatch]);

  return (
    <BiomeCombinedProviders theme={{ base: biomeTheme }}>
      <ViewContext.Provider value={viewReducerValues}>
        {viewState.view.type === SharedViews.LOADING_VIEW && (
          <LoadingView loadingText={initialLoadingText} showFooterLogo />
        )}
        {viewState.view.type === OnRampWidgetViews.IN_PROGRESS && (
          <LoadingView loadingText="Processing payment" showFooterLogo />
        )}

        {viewState.view.type === OnRampWidgetViews.SUCCESS && (
          <StatusView
            statusText="Coins are on the way"
            actionText="Done"
            onRenderEvent={sendOnRampWidgetCloseEvent}
            onActionClick={sendOnRampWidgetCloseEvent}
            statusType={StatusType.SUCCESS}
            testId="success-view"
          />
        )}

        <OnRampMain
          environment={environment}
          walletAddress={walletAddress}
          isPassport={isPassport}
          email={emailAddress}
          showIframe={showIframe}
        />

        {viewState.view.type === SharedViews.TOP_UP_VIEW && (
          <TopUpView
            widgetEvent={IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT}
            showOnrampOption={isOnRampEnabled}
            showSwapOption={isSwapEnabled}
            showBridgeOption={isBridgeEnabled}
            onCloseButtonClick={sendOnRampWidgetCloseEvent}
          />
        )}
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
