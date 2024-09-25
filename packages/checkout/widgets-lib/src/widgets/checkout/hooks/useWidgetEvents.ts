import { useEffect, useMemo } from 'react';
import {
  IMTBLWidgetEvents,
  OrchestrationEvent,
  OrchestrationEventType,
} from '@imtbl/checkout-sdk';
import { getCheckoutWidgetEvent } from '../functions/getCheckoutWidgetEvent';
import { sendCheckoutEvent } from '../CheckoutWidgetEvents';
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
  IMTBLWidgetEvents.IMTBL_ADD_FUNDS_WIDGET_EVENT,
];

/**
 * Subscribe and Handle widget events
 */
export function useWidgetEvents(
  eventTarget: Window | EventTarget,
  viewState: ReturnType<typeof useViewState>,
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
   * Proxy widget events to checkout widget events
   */
  const handleWidgetEvent = useMemo(() => {
    if (!eventTarget) return null;

    return (event: Event) => {
      const customEvent = event as CustomEvent;

      if (isOrchestrationEvent(customEvent)) {
        handleOrchestrationEvent(customEvent);
        return;
      }

      const eventDetail = getCheckoutWidgetEvent(customEvent);
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
