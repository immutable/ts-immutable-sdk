import { ConnectionProviders } from '@imtbl/checkout-sdk-web';
import { WidgetTheme } from '../constants';

export type CheckoutWidgetsConfig = {
  theme: WidgetTheme;
};

export interface ConnectWidgetReactProps {
  providerPreference: ConnectionProviders;
}
