import {
  AddFundsEventType,
  BridgeEventType,
  CheckoutEventType,
  CheckoutFailureEventType,
  CheckoutSuccessEventType,
  CheckoutUserActionEventType,
  ConnectEventType,
  IMTBLWidgetEvents,
  OnRampEventType,
  ProviderEventType,
  SaleEventType,
  SwapEventType,
  WalletEventType,
  WidgetEventData,
  WidgetType,
} from '@imtbl/checkout-sdk';

type CheckoutEventDetail = {
  type: CheckoutEventType;
  data: WidgetEventData[WidgetType.CHECKOUT][keyof WidgetEventData[WidgetType.CHECKOUT]];
};

/**
 * Map Connect Widget Events
 */
function mapConnectWidgetEvent(
  event: CustomEvent<{ type: ConnectEventType; data: Record<string, unknown> }>,
): CheckoutEventDetail {
  const { type, data } = event.detail;

  switch (type) {
    case ConnectEventType.SUCCESS:
      return {
        type: CheckoutEventType.SUCCESS,
        data: {
          type: CheckoutSuccessEventType.CONNECT_SUCCESS,
          data,
        },
      };

    case ConnectEventType.FAILURE:
      return {
        type: CheckoutEventType.FAILURE,
        data: {
          type: CheckoutFailureEventType.CONNECT_FAILED,
          data,
        },
      };

    case ConnectEventType.CLOSE_WIDGET:
      return {
        type: CheckoutEventType.CLOSE,
        data: {},
      };

    default:
      throw new Error(`Unknown connect event type "${event.detail.type}"`);
  }
}

/**
 * Map Wallet Widget Events
 */
function mapWalletWidgetEvent(
  event: CustomEvent<{ type: WalletEventType; data: Record<string, unknown> }>,
): CheckoutEventDetail {
  const { type, data } = event.detail;

  switch (type) {
    case WalletEventType.NETWORK_SWITCH:
      return {
        type: CheckoutEventType.USER_ACTION,
        data: {
          type: CheckoutUserActionEventType.NETWORK_SWITCH,
          data,
        },
      };
    case WalletEventType.DISCONNECT_WALLET:
      return {
        type: CheckoutEventType.DISCONNECTED,
        data: {},
      };
    case WalletEventType.CLOSE_WIDGET:
      return {
        type: CheckoutEventType.CLOSE,
        data: {},
      };
    default:
      throw new Error(`Unknown wallet event type "${event.detail.type}"`);
  }
}

/**
 * Map Swap Widget Events
 */
function mapSwapWidgetEvent(
  event: CustomEvent<{ type: SwapEventType; data: Record<string, unknown> }>,
): CheckoutEventDetail {
  const { type, data } = event.detail;

  switch (type) {
    case SwapEventType.SUCCESS:
      return {
        type: CheckoutEventType.SUCCESS,
        data: {
          type: CheckoutSuccessEventType.SWAP_SUCCESS,
          data,
        },
      };
    case SwapEventType.FAILURE:
      return {
        type: CheckoutEventType.FAILURE,
        data: {
          type: CheckoutFailureEventType.SWAP_FAILED,
          data,
        },
      };
    case SwapEventType.REJECTED:
      return {
        type: CheckoutEventType.FAILURE,
        data: {
          type: CheckoutFailureEventType.SWAP_REJECTED,
          data,
        },
      };
    case SwapEventType.CLOSE_WIDGET:
      return {
        type: CheckoutEventType.CLOSE,
        data: {},
      };

    default:
      throw new Error(`Unknown swap event type "${event.detail.type}"`);
  }
}

/**
 * Map Add Funds Widget Events
 */
function mapAddFundsWidgetEvent(
  event: CustomEvent<{ type: AddFundsEventType; data: Record<string, unknown> }>,
): CheckoutEventDetail {
  const { type } = event.detail;

  switch (type) {
    default:
      throw new Error(`Unknown add funds event type "${event.detail.type}"`);
  }
}

/**
 * Map Bridge Widget Events
 */
function mapBridgeWidgetEvent(
  event: CustomEvent<{ type: BridgeEventType; data: Record<string, unknown> }>,
): CheckoutEventDetail {
  const { type, data } = event.detail;

  switch (type) {
    case BridgeEventType.TRANSACTION_SENT:
      return {
        type: CheckoutEventType.SUCCESS,
        data: {
          type: CheckoutSuccessEventType.BRIDGE_SUCCESS,
          data,
        },
      };
    case BridgeEventType.CLAIM_WITHDRAWAL_SUCCESS:
      return {
        type: CheckoutEventType.SUCCESS,
        data: {
          type: CheckoutSuccessEventType.BRIDGE_CLAIM_WITHDRAWAL_SUCCESS,
          data,
        },
      };
    case BridgeEventType.CLAIM_WITHDRAWAL_FAILURE:
      return {
        type: CheckoutEventType.FAILURE,
        data: {
          type: CheckoutFailureEventType.BRIDGE_CLAIM_WITHDRAWAL_FAILED,
          data,
        },
      };
    case BridgeEventType.FAILURE:
      return {
        type: CheckoutEventType.FAILURE,
        data: {
          type: CheckoutFailureEventType.BRIDGE_FAILED,
          data,
        },
      };
    case BridgeEventType.CLOSE_WIDGET:
      return {
        type: CheckoutEventType.CLOSE,
        data: {},
      };
    default:
      throw new Error(`Unknown bridge event type "${event.detail.type}"`);
  }
}

/**
 * Map Bridge Widget Events
 */
function mapOnrampWidgetEvent(
  event: CustomEvent<{ type: OnRampEventType; data: Record<string, unknown> }>,
): CheckoutEventDetail {
  const { type, data } = event.detail;

  switch (type) {
    case OnRampEventType.SUCCESS:
      return {
        type: CheckoutEventType.SUCCESS,
        data: {
          type: CheckoutSuccessEventType.ONRAMP_SUCCESS,
          data,
        },
      };
    case OnRampEventType.FAILURE:
      return {
        type: CheckoutEventType.FAILURE,
        data: {
          type: CheckoutFailureEventType.ONRAMP_FAILED,
          data,
        },
      };
    case OnRampEventType.CLOSE_WIDGET:
      return {
        type: CheckoutEventType.CLOSE,
        data: {},
      };
    default:
      throw new Error(`Unknown onRamp event type "${event.detail.type}"`);
  }
}

function mapSaleWidgetEvent(
  event: CustomEvent<{ type: SaleEventType; data: Record<string, unknown> }>,
): CheckoutEventDetail {
  const { type, data } = event.detail;

  switch (type) {
    case SaleEventType.SUCCESS:
      return {
        type: CheckoutEventType.SUCCESS,
        data: {
          type: CheckoutSuccessEventType.SALE_SUCCESS,
          data,
        },
      };
    case SaleEventType.FAILURE:
      return {
        type: CheckoutEventType.FAILURE,
        data: {
          type: CheckoutFailureEventType.SALE_FAILED,
          data,
        },
      };
    case SaleEventType.CLOSE_WIDGET:
      return {
        type: CheckoutEventType.CLOSE,
        data: {},
      };
    case SaleEventType.TRANSACTION_SUCCESS:
      return {
        type: CheckoutEventType.SUCCESS,
        data: {
          type: CheckoutSuccessEventType.SALE_TRANSACTION_SUCCESS,
          data,
        },
      };
    case SaleEventType.PAYMENT_METHOD:
      return {
        type: CheckoutEventType.USER_ACTION,
        data: {
          type: CheckoutUserActionEventType.PAYMENT_METHOD_SELECTED,
          data,
        },
      };
    case SaleEventType.PAYMENT_TOKEN:
      return {
        type: CheckoutEventType.USER_ACTION,
        data: {
          type: CheckoutUserActionEventType.PAYMENT_TOKEN_SELECTED,
          data,
        },
      };
    default:
      throw new Error(`Unknown sale event type "${event.detail.type}"`);
  }
}

/**
 * Map widget events to checkout widget event detail
 */
export function getCheckoutWidgetEvent(
  event: CustomEvent,
): CheckoutEventDetail {
  if (event.detail.type === ProviderEventType.PROVIDER_UPDATED) {
    return {
      type: CheckoutEventType.PROVIDER_UPDATED,
      data: event.detail.data,
    };
  }

  switch (event.type) {
    case IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT:
      return mapConnectWidgetEvent(event);
    case IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT:
      return mapWalletWidgetEvent(event);
    case IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT:
      return mapSwapWidgetEvent(event);
    case IMTBLWidgetEvents.IMTBL_ADD_FUNDS_WIDGET_EVENT:
      return mapAddFundsWidgetEvent(event);
    case IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT:
      return mapBridgeWidgetEvent(event);
    case IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT:
      return mapOnrampWidgetEvent(event);
    case IMTBLWidgetEvents.IMTBL_SALE_WIDGET_EVENT:
      return mapSaleWidgetEvent(event);
    default:
      throw new Error(`Unknown widget event type "${event.type}"`);
  }
}
