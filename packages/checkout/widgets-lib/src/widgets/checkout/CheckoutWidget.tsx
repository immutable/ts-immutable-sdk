import { CheckoutWidgetParams } from '@imtbl/checkout-sdk';
import {
  useContext,
} from 'react';
import { Box } from '@biom3/react';
import { ConnectLoaderContext } from '../../context/connect-loader-context/ConnectLoaderContext';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { CHECKOUT_APP_URL } from '../../lib/constants';

export type CheckoutWidgetInputs = CheckoutWidgetParams & {
  config: StrongCheckoutWidgetsConfig,
};

export default function CheckoutWidget(props: CheckoutWidgetInputs) {
  const { config } = props;
  const { environment } = config;

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    connectLoaderState: { checkout, provider },
  } = useContext(ConnectLoaderContext);

  return (
    <Box
      rc={<iframe src={CHECKOUT_APP_URL[environment]} title="checkout" />}
      sx={{
        w: '100%', h: '100%', border: 'none', boxShadow: 'none',
      }}
    />
  );
}
