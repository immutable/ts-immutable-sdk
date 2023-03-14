import './App.css';
import Connect from './components/sdk/connect/connect';
import { useState } from 'react';
import SwitchNetwork from './components/sdk/switchNetwork/switchNetwork';

function SDK () {
  const [provider, setProvider] = useState<any>();
    return (
      <div>
        <main className="checkout-sdk-app">
          <h1>Sample SDK</h1>
          <p>This is a react app which implements the Checkout SDK as a marketplace would.</p>
          <Connect setProvider={setProvider}/>
          <SwitchNetwork provider={provider} />
        </main>
      </div>
    )
}

export default SDK;