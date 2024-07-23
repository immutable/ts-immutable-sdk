import { CheckoutWidgetParams } from '@imtbl/checkout-sdk';
import {
  useContext,
} from 'react';
import { ConnectLoaderContext } from '../../context/connect-loader-context/ConnectLoaderContext';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';

export type CheckoutWidgetInputs = CheckoutWidgetParams & {
  config: StrongCheckoutWidgetsConfig,
};

export default function CheckoutWidget(props: CheckoutWidgetInputs) {
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    config,
  } = props;

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    connectLoaderState: { checkout, provider },
  } = useContext(ConnectLoaderContext);

  return (
    <div />
  );
}
