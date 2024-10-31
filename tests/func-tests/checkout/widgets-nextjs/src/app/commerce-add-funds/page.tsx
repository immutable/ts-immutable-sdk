"use client";
import { Box } from '@biom3/react';
import { checkout } from '@imtbl/sdk';
import { CommerceFlowType, ConnectionSuccess } from '@imtbl/sdk/checkout';
import { useEffect } from 'react';
import { useCommerceWidget } from '../../hooks/useCommerceWidget';

function CommerceAddFunds() {

  const { widget } = useCommerceWidget();


  useEffect(() => {
    if (!widget) return;
    widget.mount("widget-root", {
      flow: CommerceFlowType.ADD_FUNDS,
    });

    widget.addListener(
      checkout.CommerceEventType.SUCCESS,
      (payload: checkout.CommerceSuccessEvent) => {
        const { type, data } = payload;

        // capture provider after user connects their wallet
        if (type === checkout.CommerceSuccessEventType.ADD_FUNDS_SUCCESS) {
          const { transactionHash } = data;
          console.log('Add Funds Success: ', transactionHash);
        }
      }
    );

    // detect when user fails to connect
    widget.addListener(
      checkout.CommerceEventType.FAILURE,
      (payload: checkout.CommerceFailureEvent) => {
        const { type, data } = payload;

        if (type === checkout.CommerceFailureEventType.ADD_FUNDS_FAILED) {
          console.log('failed to add funds', data.reason);
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

export default CommerceAddFunds;
