import {
  BiomeCombinedProviders, Box, Button,
} from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';

import {
  useContext, useEffect, useMemo, useReducer,
} from 'react';

import { IMTBLWidgetEvents } from '@imtbl/checkout-widgets';
import {
  ConnectTargetLayer,
  WidgetTheme,
  getL1ChainId,
  getL2ChainId,
} from '../../lib';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import {
  SharedViews,
  ViewActions,
  ViewContext, initialViewState, viewReducer,
} from '../../context/view-context/ViewContext';
import {
  SmartContext, smartReducer, initialSmartState,
} from './context/SmartContext';

import { ConnectLoaderContext } from '../../context/connect-loader-context/ConnectLoaderContext';
import { ConnectLoader, ConnectLoaderParams } from '../../components/ConnectLoader/ConnectLoader';
import { BridgeWidget, BridgeWidgetParams } from '../bridge/BridgeWidget';
import { sendBridgeWidgetCloseEvent } from '../bridge/BridgeWidgetEvents';
import { text } from '../../resources/text/textConfig';
import { LoadingView } from '../../views/loading/LoadingView';
import { SmartWidgetViews } from '../../context/view-context/SwapViewContextType';
import { SwapWidget, SwapWidgetParams } from '../swap/SwapWidget';
import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';
import { SimpleTextBody } from '../../components/Body/SimpleTextBody';
import { FooterButton } from '../../components/Footer/FooterButton';
import { SmartCheckoutHero } from '../../components/Hero/SmartCheckoutHero';
import { sendSwapWidgetCloseEvent } from '../swap/SwapWidgetEvents';

export interface SmartWidgetProps {
  params: SmartWidgetParams;
  config: StrongCheckoutWidgetsConfig
}

export interface SmartWidgetParams {
  fromContractAddress?: string;
  amount?: string;
  connectLoaderParams: ConnectLoaderParams;
}

export function SmartWidget(props: SmartWidgetProps) {
  const { params, config } = props;
  const { theme } = config;
  const loadingText = text.views[SharedViews.LOADING_VIEW].text;

  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);

  const viewReducerValues = useMemo(() => ({ viewState, viewDispatch }), [viewState, viewDispatch]);
  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout } = connectLoaderState;

  const [smartState, smartDispatch] = useReducer(smartReducer, initialSmartState);
  const smartReducerValues = useMemo(() => ({ smartState, smartDispatch }), [smartState, smartDispatch]);

  const biomeTheme: BaseTokens = theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;

  const { connectLoaderParams } = params;

  const bridgeLoaderParams: ConnectLoaderParams = {
    targetLayer: ConnectTargetLayer.LAYER1,
    walletProvider: connectLoaderParams.walletProvider,
    web3Provider: connectLoaderParams.web3Provider,
    passport: connectLoaderParams.passport,
    allowedChains: [
      getL1ChainId(checkout!.config),
    ],
  };

  const swapLoaderParams: ConnectLoaderParams = {
    targetLayer: ConnectTargetLayer.LAYER2,
    walletProvider: connectLoaderParams.walletProvider,
    web3Provider: connectLoaderParams.web3Provider,
    passport: connectLoaderParams.passport,
    allowedChains: [
      getL2ChainId(checkout!.config),
    ],
  };

  const bridgeParams: BridgeWidgetParams = {
    amount: '1',
    fromContractAddress: '0x2Fa06C6672dDCc066Ab04631192738799231dE4a',
  };

  const swapParams: SwapWidgetParams = {
    amount: '100',
    fromContractAddress: '0xaC953a0d7B67Fae17c87abf79f09D0f818AC66A2',
    toContractAddress: '0x12739A8f1A8035F439092D016DAE19A2874F30d2',

  };

  const swapClick = () => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: SmartWidgetViews.SMART_SWAP,
          data: viewState.view.data,
        },
      },
    });
  };

  const bridgeClick = () => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: SmartWidgetViews.SMART_BRIDGE,
          data: viewState.view.data,
        },
      },
    });
  };

  const onStartClick = () => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: { type: SmartWidgetViews.SMART_BRIDGE },
      },
    });
  };

  const eventTarget = new EventTarget();

  const handleCustomEvent = (event) => {
    console.log('Custom event triggered!', event);
    // Handle the custom event here
  };

  useEffect(() => {
    // Add a custom event listener when the component mounts
    eventTarget.addEventListener(IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT, handleCustomEvent);

    // Remove the custom event listener when the component unmounts
    return () => {
      eventTarget.removeEventListener(IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT, handleCustomEvent);
    };
  }, [eventTarget]);

  const triggerCustomEvent = () => {
    // Create and dispatch the custom event
    const customEvent = new CustomEvent(IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT);
    eventTarget.dispatchEvent(customEvent);
  };

  useEffect(() => {
    const handleBridgeWidgetEvents = ((event: CustomEvent) => {
      console.log('EVENT INNER', event);
    }) as EventListener;

    if (viewReducerValues.viewState.view.type === SmartWidgetViews.SMART_BRIDGE) {
      window.addEventListener(
        IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT,
        handleBridgeWidgetEvents,
      );
    }

    return () => {
      window.removeEventListener(
        IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT,
        handleBridgeWidgetEvents,
      );
    };
  }, [viewReducerValues.viewState.view.type]);

  useEffect(() => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: { type: SmartWidgetViews.SMART_CHECKOUT },
      },
    });
  }, [checkout]);

  return (
    <BiomeCombinedProviders theme={{ base: biomeTheme }}>
      <ViewContext.Provider value={viewReducerValues}>
        <SmartContext.Provider value={smartReducerValues}>
          {viewReducerValues.viewState.view.type === SharedViews.LOADING_VIEW && (
            <LoadingView loadingText={loadingText} />
          )}

          {viewReducerValues.viewState.view.type === SmartWidgetViews.SMART_CHECKOUT && (
            <SimpleLayout
              testId="ready-to-connect"
              floatHeader
              heroContent={<SmartCheckoutHero />}
              footer={(
                <FooterButton
                  actionText="Let's do it"
                  onActionClick={onStartClick}
                />
            )}
            >
              <SimpleTextBody heading="You'll need more coins">
                It&lsquo;s a bit tricky, so let&lsquo;s make it easy for you
              </SimpleTextBody>
            </SimpleLayout>
          )}
          {viewReducerValues.viewState.view.type === SmartWidgetViews.SMART_BRIDGE && (
            <ConnectLoader
              params={bridgeLoaderParams}
              closeEvent={() => sendBridgeWidgetCloseEvent(eventTarget)}
              widgetConfig={config}
            >
              <BridgeWidget
                params={bridgeParams}
                config={config}
                eventTarget={eventTarget}
              />
            </ConnectLoader>
          )}

          {viewReducerValues.viewState.view.type === SmartWidgetViews.SMART_SWAP && (
            <ConnectLoader
              params={swapLoaderParams}
              closeEvent={() => sendSwapWidgetCloseEvent}
              widgetConfig={config}
            >
              <SwapWidget
                params={swapParams}
                config={config}
              />
            </ConnectLoader>
          )}
          <Box sx={{
            width: '430px', backgroundColor: '#0D0D0D', marginTop: '10px', padding: '16px', borderRadius: '8px',
          }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', columnGap: '16px' }}>
              <Button sx={{ flexGrow: 1 }} onClick={bridgeClick}>BRIDGE</Button>
              <Button sx={{ flexGrow: 1 }} onClick={swapClick}>SWAP</Button>
              <Button sx={{ flexGrow: 1 }} onClick={triggerCustomEvent}>EVENT</Button>
            </Box>

          </Box>

        </SmartContext.Provider>
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
