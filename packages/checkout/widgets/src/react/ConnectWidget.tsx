import React from 'react';

/**
 * Interface representing the props for the Connect Widget component.
 * @property {string} providerPreference - The preferred provider for the Connect Widget
 * (default: "metamask").
 */
export interface ConnectReactProps {
  providerName?: string;
}

/**
 * A React functional component that renders the Checkout Connect Widget.
 * @param {ConnectReactProps} props - The props for the Connect Widget component.
 * @returns {JSX.Element} - The rendered Connect Widget component.
 */
export function ConnectReact(props: ConnectReactProps): JSX.Element {
  const { providerName } = props;

  const config = window.ImtblCheckoutWidgetConfig;

  return (
    <imtbl-connect
      widgetConfig={config}
      providerName={providerName}
    />
  );
}
