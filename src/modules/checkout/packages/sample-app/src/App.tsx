import './App.css';
import Connect from './components/connect/connect';
import { useState } from 'react';
import SwitchNetwork from './components/switchNetwork/switchNetwork';
import {Web3Provider} from '@ethersproject/providers'

function App () {
  const [provider, setProvider] = useState<Web3Provider>();

    return (
      <div>
        <main className="checkout-sdk-app">
          <h1>Sample App</h1>
          <p>This is a react app which implements the CheckoutSDK.</p>
          <Connect setProvider={setProvider}/>
          <SwitchNetwork provider={provider} />
        </main>
      </div>     
    )
}

export default App;