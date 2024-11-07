"use client";
import { Box } from '@biom3/react';
import { Web3Provider } from '@ethersproject/providers';
import { checkout } from '@imtbl/sdk';
import { CommerceFlowType } from '@imtbl/sdk/checkout';
import { useEffect, useMemo } from 'react';
import { useCommerceWidget } from '../../hooks/useCommerceWidget';
import { MockProvider } from '../utils/mockProvider';

function CommerceSale() {
  const { widget, factory } = useCommerceWidget();
  const provider = useMemo(() => new Web3Provider(new MockProvider()), []);

  useEffect(() => {
    if (!widget || !factory) return;

    factory.updateProvider(provider);

    widget.mount("widget-root", {
      flow: CommerceFlowType.SALE,
    });

    widget.addListener(
      checkout.CommerceEventType.SUCCESS,
      (payload: checkout.CommerceSuccessEvent) => {
        const { type, data } = payload;

        // capture provider after user completes sale
        if (type === checkout.CommerceSuccessEventType.SALE_SUCCESS) {
          const { transactionHash } = data;
          console.log('sale success', transactionHash);
        }
      }
    );

    // detect when user fails to complete sale
    widget.addListener(
      checkout.CommerceEventType.FAILURE,
      (payload: checkout.CommerceFailureEvent) => {
        const { type, data } = payload;

        if (type === checkout.CommerceFailureEventType.SALE_FAILED) {
          console.log('failed to sale', data.reason);
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

export default CommerceSale;