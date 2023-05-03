import {
  WidgetTheme,
  ConnectionProviders,
  Network,
  SetProvider,
  CheckoutWidgets,
  CheckoutWidgetTagNames,
  ExampleWidgetReact,
} from '@imtbl/checkout-widgets-react';
import detectEthereumProvider from '@metamask/detect-provider';
import { Web3Provider } from '@ethersproject/providers';
import { useState } from 'react';

function ExampleUI() {
  CheckoutWidgets({
    theme: WidgetTheme.DARK,
  });
  const [theme, setTheme] = useState(WidgetTheme.DARK);

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
      <ExampleWidgetReact providerPreference={ConnectionProviders.METAMASK} />
      <br />
      <button onClick={() => setProvider()}>Set Provider</button>
      <br />
      <br />
      <button onClick={() => updateTheme()}>Update Theme</button>
    </div>
  );
}

export default ExampleUI;
