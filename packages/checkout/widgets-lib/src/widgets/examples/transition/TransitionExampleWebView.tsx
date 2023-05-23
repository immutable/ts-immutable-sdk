import { ConnectionProviders } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { WidgetTheme } from '../../../lib';

function TransitionExampleWebView() {
  return (
    <imtbl-transition-example
      providerPreference={ConnectionProviders.METAMASK}
      theme={WidgetTheme.DARK}
      environment={Environment.SANDBOX}
    />
  );
}

export default TransitionExampleWebView;
