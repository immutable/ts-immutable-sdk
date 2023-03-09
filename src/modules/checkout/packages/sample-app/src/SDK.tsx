import './App.css';
import Connect from './components/sdk/connect/connect';
import { BiomeThemeProvider, Heading } from '@biom3/react'
import { useState } from 'react';
import SwitchNetwork from './components/sdk/switchNetwork/switchNetwork';

function SDK () {
  const [provider, setProvider] = useState<any>();
    return (
      <BiomeThemeProvider>
        <main className="checkout-sdk-app">
          <Heading as="h1">Sample SDK</Heading>
          <p>This is a react app which implements the Checkout SDK as a marketplace would.</p>
          <Connect setProvider={setProvider}/>
          <SwitchNetwork provider={provider} />
        </main>
      </BiomeThemeProvider>
    )
}

export default SDK;