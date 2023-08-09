import React, { useEffect } from 'react';
import { SetPassport } from './internal/SetPassport';
import { CheckoutWidgetTagNames } from '../definitions/types';

/**
 * A React functional component that renders the Checkout Connect Widget.
 * @returns {JSX.Element} - The rendered Connect Widget component.
 */

interface ConnectReactProps {
  passport?: any;
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
