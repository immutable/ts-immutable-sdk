"use client";
import { Box } from '@biom3/react';
import { checkout } from '@imtbl/sdk';
import { CommerceFlowType, ConnectionSuccess } from '@imtbl/sdk/checkout';
import { useEffect } from 'react';
import { useCommerceWidget } from '../../hooks/useCommerceWidget';

function CommerceAddTokens() {

  const { widget } = useCommerceWidget();


  useEffect(() => {
    if (!widget) return;
    widget.mount("widget-root", {
      flow: CommerceFlowType.ADD_TOKENS,
    });

    widget.addListener(
      checkout.CommerceEventType.SUCCESS,
      (payload: checkout.CommerceSuccessEvent) => {
        const { type, data } = payload;

        // capture transaction hash after user adds tokens
        if (type === checkout.CommerceSuccessEventType.ADD_TOKENS_SUCCESS) {
          const { transactionHash } = data;
          console.log('Add Tokens Success: ', transactionHash);
        }
      }
    );

    // detect when user fails to add tokens
    widget.addListener(
      checkout.CommerceEventType.FAILURE,
      (payload: checkout.CommerceFailureEvent) => {
        const { type, data } = payload;

        if (type === checkout.CommerceFailureEventType.ADD_TOKENS_FAILED) {
          console.log('failed to add tokens', data.reason);
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

export default CommerceAddTokens;
