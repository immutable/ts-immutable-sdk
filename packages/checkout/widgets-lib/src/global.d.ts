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
  ImtblPrimaryRevenueProps,
} from '@imtbl/checkout-widgets';

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
      'imtbl-primary-revenue': ImtblPrimaryRevenueProps;
      'imtbl-example': ImtblExampleProps;
      'imtbl-transition-example': ImtblTransitionExampleProps;
      'imtbl-inner-widget-example': ImtblInnerWidgetExampleProps;
      'imtbl-outer-widget-example': ImtblOuterWidgetExampleProps;
    }
  }
  interface ImmutableWebComponent {
    setProvider: Function;
    addPassportOption: Function;
    setAttribute: Function;
  }
}

export {};
