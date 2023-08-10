import { Passport } from '@imtbl/passport';
import React, { useEffect } from 'react';
import { CheckoutWidgetTagNames } from '../definitions/types';
import { SetPassport } from './internal/SetPassport';

/**
 * A React functional component that renders the Checkout Connect Widget.
 * @returns {JSX.Element} - The rendered Connect Widget component.
 */

export interface ConnectReactProps {
  passport?: Passport;
}

export function ConnectReact({ passport }: ConnectReactProps): JSX.Element {
  const config = window.ImtblCheckoutWidgetConfig;

  useEffect(() => {
    if (passport) {
      SetPassport(CheckoutWidgetTagNames.CONNECT, passport);
    }
  }, [passport]);

  return (
    <imtbl-connect
      widgetConfig={config}
    />
  );
}
