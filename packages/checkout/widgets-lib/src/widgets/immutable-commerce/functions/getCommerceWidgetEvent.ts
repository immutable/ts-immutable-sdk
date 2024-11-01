import {
  AddTokensEventType,
  BridgeEventType,
  CommerceEventType,
  CommerceFailureEventType,
  CommerceSuccessEventType,
  CommerceUserActionEventType,
  ConnectEventType,
  IMTBLWidgetEvents,
  OnRampEventType,
  ProviderEventType,
  SaleEventType,
  SwapEventType,
  WalletEventType,
} from '@imtbl/checkout-sdk';

import { CommerceEventDetail } from '../CommerceWidgetEvents';

/**
 * Map Connect Widget Events
 */
function mapConnectWidgetEvent(
  event: CustomEvent<{ type: ConnectEventType; data: Record<string, unknown> }>,
): CommerceEventDetail {
  const { type, data } = event.detail;

  switch (type) {
    case ConnectEventType.SUCCESS:
      return {
        type: CommerceEventType.SUCCESS,
        data: {
          type: CommerceSuccessEventType.CONNECT_SUCCESS,
          data,
        },
      };

    case ConnectEventType.FAILURE:
      return {
        type: CommerceEventType.FAILURE,
        data: {
          type: CommerceFailureEventType.CONNECT_FAILED,
          data,
        },
      };

    case ConnectEventType.CLOSE_WIDGET:
      return {
        type: CommerceEventType.CLOSE,
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
): CommerceEventDetail {
  const { type, data } = event.detail;

  switch (type) {
    case WalletEventType.NETWORK_SWITCH:
      return {
        type: CommerceEventType.USER_ACTION,
        data: {
          type: CommerceUserActionEventType.NETWORK_SWITCH,
          data,
        },
      };
    case WalletEventType.DISCONNECT_WALLET:
      return {
        type: CommerceEventType.DISCONNECTED,
        data: {},
      };
    case WalletEventType.CLOSE_WIDGET:
      return {
        type: CommerceEventType.CLOSE,
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
): CommerceEventDetail {
  const { type, data } = event.detail;

  switch (type) {
    case SwapEventType.SUCCESS:
      return {
        type: CommerceEventType.SUCCESS,
        data: {
          type: CommerceSuccessEventType.SWAP_SUCCESS,
          data,
        },
      };
    case SwapEventType.FAILURE:
      return {
        type: CommerceEventType.FAILURE,
        data: {
          type: CommerceFailureEventType.SWAP_FAILED,
          data,
        },
      };
    case SwapEventType.REJECTED:
      return {
        type: CommerceEventType.FAILURE,
        data: {
          type: CommerceFailureEventType.SWAP_REJECTED,
          data,
        },
      };
    case SwapEventType.CLOSE_WIDGET:
      return {
        type: CommerceEventType.CLOSE,
        data: {},
      };

    default:
      throw new Error(`Unknown swap event type "${event.detail.type}"`);
  }
}

/**
 * Map Add Tokens Widget Events
 */
function mapAddTokensWidgetEvent(
  event: CustomEvent<{ type: AddTokensEventType; data: Record<string, unknown> }>,
): CommerceEventDetail {
  const { type } = event.detail;

  switch (type) {
    default:
      throw new Error(`Unknown add tokens event type "${event.detail.type}"`);
  }
}

/**
 * Map Bridge Widget Events
 */
function mapBridgeWidgetEvent(
  event: CustomEvent<{ type: BridgeEventType; data: Record<string, unknown> }>,
): CommerceEventDetail {
  const { type, data } = event.detail;

  switch (type) {
    case BridgeEventType.TRANSACTION_SENT:
      return {
        type: CommerceEventType.SUCCESS,
        data: {
          type: CommerceSuccessEventType.BRIDGE_SUCCESS,
          data,
        },
      };
    case BridgeEventType.CLAIM_WITHDRAWAL_SUCCESS:
      return {
        type: CommerceEventType.SUCCESS,
        data: {
          type: CommerceSuccessEventType.BRIDGE_CLAIM_WITHDRAWAL_SUCCESS,
          data,
        },
      };
    case BridgeEventType.CLAIM_WITHDRAWAL_FAILURE:
      return {
        type: CommerceEventType.FAILURE,
        data: {
          type: CommerceFailureEventType.BRIDGE_CLAIM_WITHDRAWAL_FAILED,
          data,
        },
      };
    case BridgeEventType.FAILURE:
      return {
        type: CommerceEventType.FAILURE,
        data: {
          type: CommerceFailureEventType.BRIDGE_FAILED,
          data,
        },
      };
    case BridgeEventType.CLOSE_WIDGET:
      return {
        type: CommerceEventType.CLOSE,
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
): CommerceEventDetail {
  const { type, data } = event.detail;

  switch (type) {
    case OnRampEventType.SUCCESS:
      return {
        type: CommerceEventType.SUCCESS,
        data: {
          type: CommerceSuccessEventType.ONRAMP_SUCCESS,
          data,
        },
      };
    case OnRampEventType.FAILURE:
      return {
        type: CommerceEventType.FAILURE,
        data: {
          type: CommerceFailureEventType.ONRAMP_FAILED,
          data,
        },
      };
    case OnRampEventType.CLOSE_WIDGET:
      return {
        type: CommerceEventType.CLOSE,
        data: {},
      };
    default:
      throw new Error(`Unknown onRamp event type "${event.detail.type}"`);
  }
}

function mapSaleWidgetEvent(
  event: CustomEvent<{ type: SaleEventType; data: Record<string, unknown> }>,
): CommerceEventDetail {
  const { type, data } = event.detail;

  switch (type) {
    case SaleEventType.SUCCESS:
      return {
        type: CommerceEventType.SUCCESS,
        data: {
          type: CommerceSuccessEventType.SALE_SUCCESS,
          data,
        },
      };
    case SaleEventType.FAILURE:
      return {
        type: CommerceEventType.FAILURE,
        data: {
          type: CommerceFailureEventType.SALE_FAILED,
          data,
        },
      };
    case SaleEventType.CLOSE_WIDGET:
      return {
        type: CommerceEventType.CLOSE,
        data: {},
      };
    case SaleEventType.TRANSACTION_SUCCESS:
      return {
        type: CommerceEventType.SUCCESS,
        data: {
          type: CommerceSuccessEventType.SALE_TRANSACTION_SUCCESS,
          data,
        },
      };
    case SaleEventType.PAYMENT_METHOD:
      return {
        type: CommerceEventType.USER_ACTION,
        data: {
          type: CommerceUserActionEventType.PAYMENT_METHOD_SELECTED,
          data,
        },
      };
    case SaleEventType.PAYMENT_TOKEN:
      return {
        type: CommerceEventType.USER_ACTION,
        data: {
          type: CommerceUserActionEventType.PAYMENT_TOKEN_SELECTED,
          data,
        },
      };
    default:
      throw new Error(`Unknown sale event type "${event.detail.type}"`);
  }
}

/**
 * Map widget events to commerce widget event detail
 */
export function getCommerceWidgetEvent(
  event: CustomEvent,
): CommerceEventDetail {
  if (event.detail.type === ProviderEventType.PROVIDER_UPDATED) {
    return {
      type: CommerceEventType.PROVIDER_UPDATED,
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
    case IMTBLWidgetEvents.IMTBL_ADD_TOKENS_WIDGET_EVENT:
      return mapAddTokensWidgetEvent(event);
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
