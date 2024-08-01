import {
  useContext, useEffect, useMemo, useReducer,
} from 'react';
import {
  Checkout,
  CheckoutEventType,
  CheckoutWidgetConfiguration,
  CheckoutWidgetParams,
  IMTBLWidgetEvents,
  WalletProviderName,
} from '@imtbl/checkout-sdk';
import {
  CheckoutActions,
  checkoutReducer,
  initialCheckoutState,
} from './context/CheckoutContext';
import { CheckoutContextProvider } from './context/CheckoutContextProvider';
import { CheckoutAppIframe } from './views/CheckoutAppIframe';
import { getIframeURL } from './functions/iframeParams';
import {
  sendCheckoutEvent,
  sendCheckoutReadyEvent,
} from './CheckoutWidgetEvents';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';

const widgetEventsList = [
  IMTBLWidgetEvents.IMTBL_WIDGETS_PROVIDER,
  IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT,
  IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
  IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT,
  IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT,
  IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT,
  IMTBLWidgetEvents.IMTBL_SALE_WIDGET_EVENT,
  IMTBLWidgetEvents.IMTBL_CHECKOUT_WIDGET_EVENT,
];

export type CheckoutWidgetInputs = {
  checkout: Checkout;
  params: CheckoutWidgetParams;
  config: CheckoutWidgetConfiguration;
};

export default function CheckoutWidget(props: CheckoutWidgetInputs) {
  const { config, checkout, params } = props;
  const { environment, publishableKey } = checkout.config;
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const [targetOrigin, iframeUrl] = useMemo(() => {
    if (!publishableKey) return ['', ''];
    return getIframeURL(params, config, environment, publishableKey);
  }, [params, config, environment, publishableKey]);

  const [checkoutState, checkoutDispatch] = useReducer(
    checkoutReducer,
    initialCheckoutState,
  );
  const checkoutReducerValues = useMemo(
    () => ({ checkoutState, checkoutDispatch }),
    [checkoutState, checkoutDispatch],
  );

  const handleIframeEvents = (
    event: MessageEvent<{
      type: IMTBLWidgetEvents;
      detail: {
        type: string;
        data: Record<string, unknown>;
      };
    }>,
  ) => {
    const { type } = event.data;
    if (event.origin !== targetOrigin) return;
    if (!widgetEventsList.includes(type)) return;

    const { detail } = event.data;

    switch (type) {
      case IMTBLWidgetEvents.IMTBL_CHECKOUT_WIDGET_EVENT:
        switch (detail.type) {
          case CheckoutEventType.INITIALISED:
            sendCheckoutReadyEvent(eventTarget);
            break;
          default:
            break;
        }

        break;
      default:
        sendCheckoutEvent(eventTarget, event.data);
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('message', handleIframeEvents);
    return () => window.removeEventListener('message', handleIframeEvents);
  }, []);

  useEffect(() => {
    if (iframeUrl === undefined) return;

    checkoutDispatch({
      payload: {
        type: CheckoutActions.SET_IFRAME_URL,
        iframeUrl,
      },
    });
  }, [iframeUrl]);

  useEffect(() => {
    checkoutDispatch({
      payload: {
        type: CheckoutActions.SET_CHECKOUT,
        checkout,
      },
    });

    const connectProvider = async () => {
      const createProviderResult = await checkout.createProvider({
        walletProviderName: WalletProviderName.METAMASK,
      });

      const connectResult = await checkout.connect({
        provider: createProviderResult.provider,
      });

      checkoutDispatch({
        payload: {
          type: CheckoutActions.SET_PROVIDER,
          provider: connectResult.provider,
        },
      });
    };

    connectProvider();
  }, [checkout]);

  return (
    <CheckoutContextProvider values={checkoutReducerValues}>
      <CheckoutAppIframe />
    </CheckoutContextProvider>
  );
}
