import {
  ImtblConnectProps,
  ImtblWalletProps,
  ImtblSwapProps,
  ImtblBridgeProps,
  ImtblExampleProps,
  ImtblBuyProps,
} from '@imtbl/checkout-ui-types';

declare global {
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
