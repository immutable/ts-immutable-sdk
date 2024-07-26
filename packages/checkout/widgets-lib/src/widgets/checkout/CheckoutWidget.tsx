import { useContext, useEffect, useMemo } from 'react';
import { Box } from '@biom3/react';
import {
  CheckoutWidgetParams,
  Checkout,
  CheckoutWidgetConfiguration,
  CheckoutEventType,
  IMTBLWidgetEvents,
} from '@imtbl/checkout-sdk';

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

  const [targetOrigin, iframeURL] = useMemo(() => {
    if (!publishableKey) return ['', ''];
    return getIframeURL(params, config, environment, publishableKey);
  }, [params, config, environment, publishableKey]);

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

    console.log('🍎 Ack 🍎', event.data);

    const { detail } = event.data;

    switch (type) {
      case IMTBLWidgetEvents.IMTBL_CHECKOUT_WIDGET_EVENT:

        switch (detail.type) {
          case CheckoutEventType.CHECKOUT_APP_READY:
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

  // TODO:
  // on iframe load error, go to error view 500
  // on iframe loading, show loading view, requires iframe to trigger an initialised event

  if (!iframeURL) {
    return null;
  }

  return (
    <Box
      rc={<iframe id="checkout-app" src={iframeURL} title="checkout" />}
      sx={{
        w: '100%',
        h: '100%',
        border: 'none',
        boxShadow: 'none',
      }}
    />
  );
}
