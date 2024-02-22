import { Checkout } from '@imtbl/checkout-sdk';
import {
  useEffect,
  useState,
} from 'react';

type GeoblockLoaderParams = {
  widget: React.ReactNode;
  serviceUnavailableView: React.ReactNode;
  loadingView: React.ReactNode;
  checkout: Checkout,
};

export function GeoblockLoader({
  widget,
  serviceUnavailableView,
  loadingView,
  checkout,
}: GeoblockLoaderParams) {
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setAvailable(await checkout.isSwapAvailable());
        setLoading(false);
      } catch {
        setLoading(false);
        setAvailable(false);
      }
    })();
  }, [checkout]);

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {
        // eslint-disable-next-line no-nested-ternary
        loading ? loadingView
          : available
            ? widget
            : serviceUnavailableView
      }
    </>
  );
}
