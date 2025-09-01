import { useEffect, useMemo } from 'react';
import {
  IMTBLWidgetEvents,
  ConnectEventType,
  OrchestrationEvent,
  OrchestrationEventType,
  RequestOnrampEvent,
  WrappedBrowserProvider,
} from '@imtbl/checkout-sdk';
import { getCommerceWidgetEvent } from '../functions/getCommerceWidgetEvent';
import { sendCheckoutEvent } from '../CommerceWidgetEvents';
import {
  useViewState,
  ViewActions,
} from '../../../context/view-context/ViewContext';
import { getViewFromOrchestrationEventType } from '../functions/getViewFromOrchestrationEventType';
import { isOrchestrationEvent } from '../functions/isOrchestrationEvent';

/** Widget Events List */
const widgetEvents = [
  IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT,
  IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
  IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT,
  IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT,
  IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT,
  IMTBLWidgetEvents.IMTBL_SALE_WIDGET_EVENT,
  IMTBLWidgetEvents.IMTBL_ADD_TOKENS_WIDGET_EVENT,
  IMTBLWidgetEvents.IMTBL_PURCHASE_WIDGET_EVENT,
  IMTBLWidgetEvents.IMTBL_TRANSFER_WIDGET_EVENT,
];

/**
 * Subscribe and Handle widget events
 */
export function useWidgetEvents(
  eventTarget: Window | EventTarget,
  viewState: ReturnType<typeof useViewState>,
  handleProviderUpdated: (provider: WrappedBrowserProvider) => void,
) {
  const [{ history }, viewDispatch] = viewState;

  /**
   * Change view as per orchestration event requests
   */
  const handleOrchestrationEvent = (
    event: CustomEvent<OrchestrationEvent<keyof unknown>>,
  ) => {
    const { type, data } = event.detail;

    if (type === OrchestrationEventType.REQUEST_GO_BACK) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: history?.[0],
        },
      });

      return;
    }

    if (type === OrchestrationEventType.REQUEST_ONRAMP) {
      const onRampEvent = data as RequestOnrampEvent;
      if (onRampEvent.provider) {
        handleProviderUpdated(onRampEvent.provider);
      }
    }

    const flow = getViewFromOrchestrationEventType(type);
    if (!flow) return;

    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: flow as any,
          data: { params: data, config: {}, showBackButton: true },
        },
      },
    });
  };

  /**
   * Proxy widget events to Commerce Widget events
   */
  const handleWidgetEvent = useMemo(() => {
    if (!eventTarget) return null;

    return (event: Event) => {
      const customEvent = event as CustomEvent;

      if (isOrchestrationEvent(customEvent)) {
        handleOrchestrationEvent(customEvent);
        return;
      }

      // ignore walletconnect provider updated event on CONNECT
      // as that is not really consumed and the provider is available to the consumer on success event
      // GFI-596
      const isConnectProviderUpdatedEvent = customEvent.detail.type === ConnectEventType.WALLETCONNECT_PROVIDER_UPDATED;
      if (isConnectProviderUpdatedEvent) {
        return;
      }

      const eventDetail = getCommerceWidgetEvent(customEvent);
      sendCheckoutEvent(eventTarget, eventDetail);
    };
  }, [eventTarget]);

  useEffect(() => {
    if (!handleWidgetEvent) return () => {};

    widgetEvents.map((event) => window.addEventListener(event, handleWidgetEvent));
    return () => {
      widgetEvents.map((event) => window.removeEventListener(event, handleWidgetEvent));
    };
  }, [handleWidgetEvent]);
}
