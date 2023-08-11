import { Passport } from '@imtbl/passport';
import React, { useEffect } from 'react';
import { CheckoutWidgetTagNames } from '../definitions/types';
import { AddPassportOption } from './internal/AddPassportOption';

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
      AddPassportOption(CheckoutWidgetTagNames.CONNECT, passport);
    }
  }, [passport]);

  return (
    <imtbl-connect
      widgetConfig={config}
    />
  );
}
