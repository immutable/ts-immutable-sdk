import { Passport } from '@imtbl/passport';
import { useEffect } from 'react';
import { CheckoutWidgetTagNames } from '../definitions/types';
import { AddPassportOption } from './internal/AddPassportOption';

/**
 * Interface representing the props for the Bridge Widget component.
 * @interface ConnectReactProps
 * @property {Passport | undefined} passport - The Passport instance to create a Web3Provider.
 */
export interface ConnectReactProps {
  passport?: Passport;
}

/**
 * A React functional component that renders the Checkout Connect Widget.
 * @returns {JSX.Element} - The rendered Connect Widget component.
 */
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
