import { NetworkInfo } from '@imtbl/checkout-sdk-web';
import {
  IMTBLWidgetEvents,
  WalletEvent,
  WalletEventType,
  WalletNetworkSwitchEvent,
  OrchestrationEventType,
  RequestSwapEvent,
  RequestBridgeEvent
} from '@imtbl/checkout-ui-types';

export function sendWalletWidgetCloseEvent() {
  const closeWidgetEvent = new CustomEvent<WalletEvent<any>>(
    IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
    {
      detail: {
        type: WalletEventType.CLOSE_WIDGET,
        data: {},
      },
    }
  );
  console.log('close widget event:', closeWidgetEvent);
  if (window !== undefined) window.dispatchEvent(closeWidgetEvent);
}

export function sendNetworkSwitchEvent(network: NetworkInfo) {
  const walletWidgetSwitchNetworkEvent = new CustomEvent<
    WalletEvent<WalletNetworkSwitchEvent>
  >(IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT, {
    detail: {
      type: WalletEventType.NETWORK_SWITCH,
      data: {
        network: network.name,
        chainId: network.chainId,
      },
    },
  });
  console.log('switch network event:', walletWidgetSwitchNetworkEvent);
  if (window !== undefined)
    window.dispatchEvent(walletWidgetSwitchNetworkEvent);
}

export function sendWalletWidgetRequestSwapEvent(
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: string
) {
  const walletWidgetRequestSwapEvent = new CustomEvent<WalletEvent<RequestSwapEvent>>(
    IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT, {
      detail: {
        type: OrchestrationEventType.REQUEST_SWAP,
        data: {
          fromTokenAddress,
          toTokenAddress,
          amount,
        }
      }
    }
  );
  console.log('request swap event:', walletWidgetRequestSwapEvent);
  if (window !== undefined)
    window.dispatchEvent(walletWidgetRequestSwapEvent);
}

export function sendWalletWidgetRequestBridgeEvent(
  fromTokenAddress: string,
  amount: string
) {
  const walletWidgetRequestBridgeEvent = new CustomEvent<WalletEvent<RequestBridgeEvent>>(
    IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT, {
      detail: {
        type: OrchestrationEventType.REQUEST_BRIDGE,
        data: {
          fromTokenAddress,
          amount
        }
      }
    }
  );
  console.log('request bridge event:', walletWidgetRequestBridgeEvent);
  if (window !== undefined)
    window.dispatchEvent(walletWidgetRequestBridgeEvent);
}
