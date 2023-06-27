import React from 'react';

/**
 * A React functional component that renders the Checkout Connect Widget.
 * @returns {JSX.Element} - The rendered Connect Widget component.
 */

export function ConnectReact(): JSX.Element {
  const config = window.ImtblCheckoutWidgetConfig;

  return (
    <imtbl-connect
      widgetConfig={config}
    />
  );
}
