/* eslint-disable max-len */
import {
  Widget, Checkout, ConnectWidgetProps, BridgeWidgetProps, WidgetType, WidgetProps, WidgetConfiguration,
} from '@imtbl/checkout-sdk';
import { Bridge, Connect } from 'CheckoutWidgets';

export class WidgetsFactory {
  private sdk: Checkout;

  private widgetConfig: WidgetConfiguration;

  private createdWidgets: Widget[] = [];

  constructor(sdk: Checkout, widgetConfig: WidgetConfiguration) {
    this.sdk = sdk;
    this.widgetConfig = widgetConfig;
  }

  create(widgetType: WidgetType, params: WidgetProps): Widget {
    switch (widgetType) {
      case 'connect': {
        // validate props here
        const connectProps = params;
        const connect = new Connect(this.sdk, this.widgetConfig, connectProps as ConnectWidgetProps);
        this.createdWidgets.push(connect);
        return connect;
      }
      case 'bridge': {
        // validate props here
        const bridgeProps = params;
        const bridge = new Bridge(this.sdk, this.widgetConfig, bridgeProps as BridgeWidgetProps);
        this.createdWidgets.push(bridge);
        return bridge;
      }
      default:
        throw new Error('widget type not supported');
    }
  }

  updateConfig(config: WidgetConfiguration) {
    this.widgetConfig = config;
    // update all configs
    this.createdWidgets.forEach((widget) => {
      widget.updateConfig(this.widgetConfig);
    });
  }
}
