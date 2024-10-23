"use client";
import { Box } from '@biom3/react';
import { checkout } from '@imtbl/sdk';
import { CheckoutFlowType, ConnectionSuccess, Widget, WidgetType } from '@imtbl/sdk/checkout';
import { useEffect, useState } from 'react';

const checkoutSDK = new checkout.Checkout();

function Widgets() {

  const [widget, setWidget] = useState<Widget<WidgetType.UNIFIED_COMMERCE>>();

  useEffect(() => {

    const loadWidgets = async () => {
      const widgetsFactory = await checkoutSDK.widgets({ config: {} });

      const widget = widgetsFactory.create(WidgetType.UNIFIED_COMMERCE, {})
      setWidget(widget);
    }

    loadWidgets();
  }, []);


  useEffect(() => {
    if (!widget) return;
    widget.mount("widget-root", {
      flow: CheckoutFlowType.WALLET,
    });

    widget.addListener(
      checkout.CheckoutEventType.SUCCESS,
      (payload: checkout.CheckoutSuccessEvent) => {
        const { type, data } = payload;

        // capture provider after user connects their wallet
        if (type === checkout.CheckoutSuccessEventType.CONNECT_SUCCESS) {
          const { walletProviderName } = data as ConnectionSuccess;
          console.log('connected to ', walletProviderName);
          // setProvider(data.provider);

          // optional, immediately close the widget
          // widget.unmount();
        }
      }
    );

    // detect when user fails to connect
    widget.addListener(
      checkout.CheckoutEventType.FAILURE,
      (payload: checkout.CheckoutFailureEvent) => {
        const { type, data } = payload;

        if (type === checkout.CheckoutFailureEventType.CONNECT_FAILED) {
          console.log('failed to connect', data.reason);
        }
      }
    );

    // remove widget from view when closed
    widget.addListener(checkout.CheckoutEventType.CLOSE, () => {
      widget.unmount();
    });

    // clean up event listeners
    return () => {
      widget.removeListener(checkout.CheckoutEventType.SUCCESS);
      widget.removeListener(checkout.CheckoutEventType.DISCONNECTED);
      widget.removeListener(checkout.CheckoutEventType.CLOSE);
    };


  }, [widget]);


  return (
    <div>
      <Box
        id="widget-root"
        sx={{
          minw: "430px",
          minh: "650px",
          bg: "base.color.translucent.standard.300",
          brad: "base.borderRadius.x5",
        }}
      />
    </div>
  )
}

export default Widgets;
