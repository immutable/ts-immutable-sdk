"use client";
import { Box } from '@biom3/react';
import { checkout } from '@imtbl/sdk';
import { CommerceFlowType, ConnectionSuccess, WrappedBrowserProvider } from '@imtbl/sdk/checkout';
import { useEffect, useMemo } from 'react';
import { useCommerceWidget } from '../../hooks/useCommerceWidget';
import { MockProvider } from '../utils/mockProvider';

function CommerceWallet() {
  const { widget, factory } = useCommerceWidget();
  const provider = useMemo(() => new WrappedBrowserProvider(new MockProvider()), []);

  useEffect(() => {
    if (!widget || !factory) return;

    factory.updateProvider(provider);

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

export default CommerceWallet;
