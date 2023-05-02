import { ConnectionProviders } from '@imtbl/checkout-sdk';
import { WidgetTheme } from '../constants';

export type CheckoutWidgetsConfig = {
  theme: WidgetTheme;
};

export interface ConnectWidgetReactProps {
  providerPreference: ConnectionProviders;
}
