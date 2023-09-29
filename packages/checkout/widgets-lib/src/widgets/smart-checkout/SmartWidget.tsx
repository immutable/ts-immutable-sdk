import {
  BiomeCombinedProviders, Box, Button,
} from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';

import {
  useCallback,
  useContext, useEffect, useMemo, useReducer, useRef,
} from 'react';

import { ConnectEventType, ConnectionSuccess, IMTBLWidgetEvents } from '@imtbl/checkout-widgets';

import {
  ConnectTargetLayer,
  // ConnectTargetLayer,
  WidgetTheme, getL1ChainId, getL2ChainId,
  // getL1ChainId,
  // getL2ChainId,
} from '../../lib';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import {
  SharedViews,
  View,
  ViewActions,
  ViewContext, initialViewState, viewReducer,
} from '../../context/view-context/ViewContext';
import {
  SmartContext, smartReducer, initialSmartState,
} from './context/SmartContext';

import {
  ConnectLoaderActions,
  ConnectLoaderContext,
} from '../../context/connect-loader-context/ConnectLoaderContext';
// import { ConnectLoader, ConnectLoaderParams } from '../../components/ConnectLoader/ConnectLoader';
import { BridgeWidget, BridgeWidgetParams } from '../bridge/BridgeWidget';
// import { sendBridgeWidgetCloseEvent } from '../bridge/BridgeWidgetEvents';
import { text } from '../../resources/text/textConfig';
import { LoadingView } from '../../views/loading/LoadingView';
import { SmartWidgetViews } from '../../context/view-context/SmartViewContextType';
import { SwapWidget, SwapWidgetParams } from '../swap/SwapWidget';
import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';
import { SimpleTextBody } from '../../components/Body/SimpleTextBody';
import { FooterButton } from '../../components/Footer/FooterButton';
import { SmartCheckoutHero } from '../../components/Hero/SmartCheckoutHero';
// import { sendSwapWidgetCloseEvent } from '../swap/SwapWidgetEvents';
import {
  EventTargetActions, EventTargetContext, eventTargetReducer, initialEventTargetState,
} from '../../context/event-target-context/EventTargetContext';
import { WalletWidget } from '../wallet/WalletWidget';
import { ConnectWidgetViews } from '../../context/view-context/ConnectViewContextTypes';
import { ConnectWidget } from '../connect/ConnectWidget';

export interface SmartWidgetProps {
  params: SmartWidgetParams;
  config: StrongCheckoutWidgetsConfig
}

export interface SmartWidgetParams {
  fromContractAddress?: string;
  amount?: string;
}

export function SmartWidget(props: SmartWidgetProps) {
  const { config, params } = props;
  const { theme } = config;
  const loadingText = text.views[SharedViews.LOADING_VIEW].text;

  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);

  const nextView = useRef<View | false>(false);

  const viewReducerValues = useMemo(() => ({ viewState, viewDispatch }), [viewState, viewDispatch]);
  const { connectLoaderState, connectLoaderDispatch } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;

  const [smartState, smartDispatch] = useReducer(smartReducer, initialSmartState);
  const smartReducerValues = useMemo(() => ({ smartState, smartDispatch }), [smartState, smartDispatch]);

  const [eventTargetState, eventTargetDispatch] = useReducer(eventTargetReducer, initialEventTargetState);
  const eventTargetReducerValues = useMemo(() => (
    { eventTargetState, eventTargetDispatch }), [eventTargetState, eventTargetDispatch]);

  const biomeTheme: BaseTokens = theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;

  const eventTarget = new EventTarget();

  const bridgeParams: BridgeWidgetParams = {
    amount: '1',
    fromContractAddress: '0x2Fa06C6672dDCc066Ab04631192738799231dE4a',
  };

  const swapParams: SwapWidgetParams = {
    amount: '100',
    fromContractAddress: '0xaC953a0d7B67Fae17c87abf79f09D0f818AC66A2',
    toContractAddress: '0x12739A8f1A8035F439092D016DAE19A2874F30d2',

  };

  const swapClick = useCallback(async () => {
    if (!checkout || !provider) return;
    const network = await checkout.getNetworkInfo({
      provider,
    });

    if (network.chainId === getL2ChainId(checkout!.config)) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SmartWidgetViews.SMART_SWAP,
            data: viewState.view.data,
          },
        },
      });
      return;
    }
    nextView.current = {
      type: SmartWidgetViews.SMART_SWAP,
      data: viewState.view.data,
    };
    console.log('setNextView swap', nextView);
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: SmartWidgetViews.SWITCH_NETWORK_ZKEVM,
          data: viewState.view.data,
        },
      },
    });
    // await switchNetwork(getL2ChainId(checkout!.config));
  }, [provider]);

  const bridgeClick = useCallback(async () => {
    if (!checkout || !provider) return;
    const network = await checkout.getNetworkInfo({
      provider,
    });

    if (network.chainId === getL1ChainId(checkout!.config)) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SmartWidgetViews.SMART_BRIDGE,
            data: viewState.view.data,
          },
        },
      });
      return;
    }
    nextView.current = {
      type: SmartWidgetViews.SMART_BRIDGE,
      data: viewState.view.data,
    };
    console.log('setNextView bridge', nextView);

    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: SmartWidgetViews.SWITCH_NETWORK_ETH,
          data: viewState.view.data,
        },
      },
    });
    // await switchNetwork(getL2ChainId(checkout!.config));
  }, [provider]);

  const walletClick = () => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: SmartWidgetViews.SMART_WALLET,
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

  const handleCustomEvent = (event) => {
    console.log('Custom event triggered!', event);
    // Handle the custom event here
  };

  const handleConnectEvent = (event) => {
    console.log('Connect event triggered!', event);
    switch (event.detail.type) {
      case ConnectEventType.SUCCESS: {
        const eventData = event.detail.data as ConnectionSuccess;
        connectLoaderDispatch({
          payload: {
            type: ConnectLoaderActions.SET_PROVIDER,
            provider: eventData.provider,
          },
        });
        console.log('nextView', nextView);
        if (nextView.current !== false) {
          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: nextView.current,
            },
          });
          nextView.current = false;
        }
        break;
      }
      default:
        console.log('invalid event');
    }
  };

  useEffect(() => {
    console.log('nextView set listener', nextView);
    // Add a custom event listener when the component mounts
    eventTarget.addEventListener(IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT, handleConnectEvent);
    eventTarget.addEventListener(IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT, handleCustomEvent);
    eventTarget.addEventListener(IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT, handleCustomEvent);
    eventTarget.addEventListener(IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT, handleCustomEvent);

    // Remove the custom event listener when the component unmounts
    return () => {
      eventTarget.removeEventListener(IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT, handleCustomEvent);
      eventTarget.removeEventListener(IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT, handleCustomEvent);
      eventTarget.removeEventListener(IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT, handleCustomEvent);
      eventTarget.removeEventListener(IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT, handleCustomEvent);
    };
  });

  useEffect(() => {
    eventTargetDispatch({
      payload: {
        type: EventTargetActions.SET_EVENT_TARGET,
        eventTarget,
      },
    });
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
          <EventTargetContext.Provider value={eventTargetReducerValues}>
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
            {viewReducerValues.viewState.view.type === SmartWidgetViews.SWITCH_NETWORK_ZKEVM && (
              <ConnectWidget
                config={config}
                params={{
                  ...params, targetLayer: ConnectTargetLayer.LAYER2, web3Provider: provider,
                }}
                deepLink={ConnectWidgetViews.SWITCH_NETWORK}
              />
            )}
            {viewReducerValues.viewState.view.type === SmartWidgetViews.SWITCH_NETWORK_ETH && (
              <ConnectWidget
                config={config}
                params={{
                  ...params, targetLayer: ConnectTargetLayer.LAYER1, web3Provider: provider,
                }}
                deepLink={ConnectWidgetViews.SWITCH_NETWORK}
              />
            )}
            {viewReducerValues.viewState.view.type === SmartWidgetViews.SMART_BRIDGE && (
              <BridgeWidget
                params={bridgeParams}
                config={config}
              />
            )}
            {viewReducerValues.viewState.view.type === SmartWidgetViews.SMART_SWAP && (
              <SwapWidget
                params={swapParams}
                config={config}
              />
            )}
            {viewReducerValues.viewState.view.type === SmartWidgetViews.SMART_WALLET && (
              <WalletWidget
                config={config}
              />
            )}
            <Box sx={{
              width: '430px', backgroundColor: '#0D0D0D', marginTop: '10px', padding: '16px', borderRadius: '8px',
            }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', columnGap: '16px' }}>
                <Button sx={{ flexGrow: 1 }} onClick={bridgeClick}>BRIDGE</Button>
                <Button sx={{ flexGrow: 1 }} onClick={swapClick}>SWAP</Button>
                <Button sx={{ flexGrow: 1 }} onClick={walletClick}>WALLET</Button>
              </Box>

            </Box>
          </EventTargetContext.Provider>
        </SmartContext.Provider>
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}
