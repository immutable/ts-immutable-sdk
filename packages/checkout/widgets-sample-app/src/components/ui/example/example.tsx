import {
  WidgetTheme,
  WidgetConnectionProviders,
  Network,
  SetProvider,
  CheckoutWidgets,
  CheckoutWidgetTagNames,
  ExampleReact,
  CheckoutWidgetsConfig,
  UpdateConfig,
} from '@imtbl/checkout-widgets';
import detectEthereumProvider from '@metamask/detect-provider';
import { Web3Provider } from '@ethersproject/providers';
import { useState } from 'react';
import { Environment } from '@imtbl/config';

function ExampleUI() {
  CheckoutWidgets({
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  });
  const [theme, setTheme] = useState(WidgetTheme.DARK);

  const widgetsConfig2: CheckoutWidgetsConfig = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  UpdateConfig(widgetsConfig2);

  async function setProvider() {
    const provider: Web3Provider | null = await detectEthereumProvider();
    const exampleElement = document.getElementsByTagName('imtbl-example')[0];
    SetProvider(CheckoutWidgetTagNames.WALLET, provider);
  }

  async function updateTheme() {
    if (theme === WidgetTheme.DARK) {
      setTheme(WidgetTheme.LIGHT);
    } else {
      setTheme(WidgetTheme.DARK);
    }
  }

  return (
    <div className="Swap">
      <h1 className="sample-heading">Checkout Example (Web Component)</h1>
      <ExampleReact providerPreference={WidgetConnectionProviders.METAMASK} />
      <br />
      <button onClick={() => setProvider()}>Set Provider</button>
      <br />
      <br />
      <button onClick={() => updateTheme()}>Update Theme</button>
    </div>
  );
}

export default ExampleUI;
