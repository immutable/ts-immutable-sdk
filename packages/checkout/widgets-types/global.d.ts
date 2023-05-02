import {
  ImtblConnectProps,
  ImtblWalletProps,
  ImtblSwapProps,
  ImtblBridgeProps,
  ImtblExampleProps,
  ImtblBuyProps,
} from './index';

declare global {
  interface Window {
    ImtblCheckoutWidgetConfig: any;
  }
  namespace JSX {
    interface IntrinsicElements {
      'imtbl-connect': ImtblConnectProps;
      'imtbl-wallet': ImtblWalletProps;
      'imtbl-swap': ImtblSwapProps;
      'imtbl-bridge': ImtblBridgeProps;
      'imtbl-example': ImtblExampleProps;
      'imtbl-buy': ImtblBuyProps;
    }
  }
  interface Element {
    setCallback: Function;
    setProvider: Function;
  }
}
