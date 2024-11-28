import { Checkout } from '@imtbl/checkout-sdk';
import {
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useHandover } from '../../lib/hooks/useHandover';

type GeoblockLoaderParams = {
  widget: React.ReactNode;
  serviceUnavailableView: React.ReactNode;
  checkout: Checkout,
  checkAvailability: () => Promise<boolean>,
};

export function GeoblockLoader({
  widget,
  serviceUnavailableView,
  checkout,
  checkAvailability,
}: GeoblockLoaderParams) {
  const { t } = useTranslation();
  const { showLoader, hideLoader, isLoading } = useHandover();
  const [requested, setRequested] = useState(false);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        showLoader({ text: t('views.LOADING_VIEW.text') });
        setRequested(true);
        setAvailable(await checkAvailability());
        hideLoader();
      } catch {
        hideLoader();
        setAvailable(false);
      }
    })();
  }, [checkout]);

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {
        requested && !isLoading && (available
          ? widget
          : serviceUnavailableView)
      }
    </>
  );
}
