import {
  WidgetTheme,
  ConnectionProviders,
  Network,
} from '@imtbl/checkout-ui-types';
import detectEthereumProvider from '@metamask/detect-provider';
import { useState } from 'react';

function ExampleUI() {
  const [theme, setTheme] = useState(WidgetTheme.DARK);

  async function setProvider() {
    const provider = await detectEthereumProvider();
    const exampleElement = document.getElementsByTagName('imtbl-example')[0];
    exampleElement.setProvider(provider);
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
      <imtbl-example
        providerPreference={ConnectionProviders.METAMASK}
        theme={theme}
      ></imtbl-example>
      <br />
      <button onClick={() => setProvider()}>Set Provider</button>
      <br />
      <br />
      <button onClick={() => updateTheme()}>Update Theme</button>
    </div>
  );
}

export default ExampleUI;
