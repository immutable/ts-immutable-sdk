import { useEffect } from 'react';

type UseTransakIframeProps = {
  onOrderCreated: () => {};
};

export const useTransakIframe = (props: UseTransakIframeProps) => {
  useEffect(
    () => () => {
      // eslint-disable-next-line no-console
      console.error(props);
    },
    []
  );

  return {};
};
