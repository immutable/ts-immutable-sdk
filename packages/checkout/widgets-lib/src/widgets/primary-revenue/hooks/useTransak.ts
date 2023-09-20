import { useEffect } from 'react';

type UseTransakProps = {
  onOrderCreated: () => {};
};

export const useTransak = (props: UseTransakProps) => {
  useEffect(
    () => () => {
      // eslint-disable-next-line no-console
      console.error(props);
    },
    [],
  );

  return {};
};
