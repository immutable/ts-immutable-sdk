/* eslint-disable @typescript-eslint/naming-convention */
import {
  ImtblConnectProps,
  ImtblWalletProps,
  ImtblSwapProps,
  ImtblBridgeProps,
  ImtblExampleProps,
  ImtblBuyProps,
  ImtblTransitionExampleProps,
  ImtblInnerWidgetExampleProps,
  ImtblOuterWidgetExampleProps,
} from './src';

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
      'imtbl-buy': ImtblBuyProps;
      'imtbl-example': ImtblExampleProps;
      'imtbl-transition-example': ImtblTransitionExampleProps;
      'imtbl-inner-widget-example': ImtblInnerWidgetExampleProps;
      'imtbl-outer-widget-example': ImtblOuterWidgetExampleProps;
    }
  }

  interface ImmutableWebComponent {
    setProvider: Function;
    setAttribute: Function;
  }
}

// Add an empty export statement to make this file a module
export {};
