import { Checkout } from '@imtbl/checkout-sdk';
import { Passport } from '@imtbl/passport';
import { Environment, ImmutableConfiguration } from '@imtbl/config';

import { useEffect, useState } from 'react';

export type UseCheckoutClientProps = {
  passport: Passport | undefined;
  environment: Environment;
};
export const useCheckoutClient = ({
  passport,
  environment,
}: UseCheckoutClientProps) => {
  const [checkoutClient, setCheckoutClient] = useState<Checkout | undefined>(
    undefined,
  );
  useEffect(() => {
    if (!passport) return;

    try {
      const checkoutInstance = new Checkout({
        baseConfig: new ImmutableConfiguration({ environment }),
        passport,
      });
      setCheckoutClient(checkoutInstance);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error creating checkout instance', err);
    }
  }, [passport, environment]);

  return checkoutClient;
};
