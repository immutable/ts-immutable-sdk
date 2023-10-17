import { BridgeWidgetProps } from './bridge';
import { ConnectWidgetProps } from './connect';
import { WidgetType } from '../types';

export type WidgetProps = ConnectWidgetProps | BridgeWidgetProps;
export type CreateParams = {
  [WidgetType.CONNECT]: ConnectWidgetProps,
  [WidgetType.BRIDGE]: BridgeWidgetProps
};
export * from './connect';
export * from './bridge';
