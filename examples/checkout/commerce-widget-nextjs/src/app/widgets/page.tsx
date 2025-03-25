"use client";
import { Box } from '@biom3/react';
import { checkout } from '@imtbl/sdk';
import { CommerceFlowType, ConnectionSuccess, Widget, WidgetType } from '@imtbl/sdk/checkout';
import { useEffect, useState } from 'react';

const checkoutSDK = new checkout.Checkout();

function Widgets() {

  const [widget, setWidget] = useState<Widget<WidgetType.IMMUTABLE_COMMERCE>>();

  useEffect(() => {

    const loadWidgets = async () => {
      const widgetsFactory = await checkoutSDK.widgets({ config: {} });

      const widget = widgetsFactory.create(WidgetType.IMMUTABLE_COMMERCE, {})
      setWidget(widget);
    }

    loadWidgets();
  }, []);


  useEffect(() => {
    if (!widget) return;
    widget.mount("widget-root", {
      flow: CommerceFlowType.WALLET,
    });

    widget.addListener(
      checkout.CommerceEventType.SUCCESS,
      (payload: checkout.CommerceSuccessEvent) => {
        const { type, data } = payload;

        // capture provider after user connects their wallet
        if (type === checkout.CommerceSuccessEventType.CONNECT_SUCCESS) {
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
      checkout.CommerceEventType.FAILURE,
      (payload: checkout.CommerceFailureEvent) => {
        const { type, data } = payload;

        if (type === checkout.CommerceFailureEventType.CONNECT_FAILED) {
          console.log('failed to connect', data.reason);
        }
      }
    );

    // remove widget from view when closed
    widget.addListener(checkout.CommerceEventType.CLOSE, () => {
      widget.unmount();
    });

    // clean up event listeners
    return () => {
      widget.removeListener(checkout.CommerceEventType.SUCCESS);
      widget.removeListener(checkout.CommerceEventType.DISCONNECTED);
      widget.removeListener(checkout.CommerceEventType.CLOSE);
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
