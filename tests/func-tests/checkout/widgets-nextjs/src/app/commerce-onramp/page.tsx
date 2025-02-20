"use client";
import { Box } from '@biom3/react';
import { checkout } from '@imtbl/sdk';
import { CommerceFlowType, WrappedBrowserProvider } from '@imtbl/sdk/checkout';
import { useEffect, useMemo } from 'react';
import { useCommerceWidget } from '../../hooks/useCommerceWidget';
import { MockProvider } from '../utils/mockProvider';

function CommerceOnRamp() {
  const { widget, factory } = useCommerceWidget();
  const provider = useMemo(() => new WrappedBrowserProvider(new MockProvider()), []);

  useEffect(() => {
    if (!widget || !factory) return;

    factory.updateProvider(provider);

    widget.mount("widget-root", {
      flow: CommerceFlowType.ONRAMP,
    });

    widget.addListener(
      checkout.CommerceEventType.SUCCESS,
      (payload: checkout.CommerceSuccessEvent) => {
        const { type, data } = payload;

        // capture provider after user onramp
        if (type === checkout.CommerceSuccessEventType.ONRAMP_SUCCESS) {
          const { transactionHash } = data;
          console.log('onramp success', transactionHash);
        }
      }
    );

    // detect when user fails to onramp
    widget.addListener(
      checkout.CommerceEventType.FAILURE,
      (payload: checkout.CommerceFailureEvent) => {
        const { type, data } = payload;

        if (type === checkout.CommerceFailureEventType.ONRAMP_FAILED) {
          console.log('failed to onramp', data.reason);
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
      widget.removeListener(checkout.CommerceEventType.FAILURE);
      widget.removeListener(checkout.CommerceEventType.CLOSE);
    };


  }, [widget, factory, provider]);


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

export default CommerceOnRamp;
