import './App.css';
import Connect from './components/connect/connect';
import { useState } from 'react';
import SwitchNetwork from './components/switchNetwork/switchNetwork';
import { Web3Provider } from '@ethersproject/providers';
import GetBalance from './components/getBalance/getBalance';
import GetAllBalances from './components/getAllBalances/getAllBalances';

function App() {
  const [provider, setProvider] = useState<Web3Provider>();

  return (
    <div>
      <main className="checkout-sdk-app">
        <h1>Checkout Sample App</h1>
        <p>This is a react app which implements Immutable's Checkout</p>
        <Connect setProvider={setProvider} />
        <SwitchNetwork provider={provider} />
        <GetBalance provider={provider} />
        <GetAllBalances provider={provider} />
      </main>
    </div>
  );
}

export default App;
