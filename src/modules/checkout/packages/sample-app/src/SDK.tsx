import './App.css';
import ConnectSDK from './components/sdk/connect/connect';
import { BiomeThemeProvider, Heading } from '@biom3/react'

function SDK () {
    return (
      <BiomeThemeProvider>
        <main className="checkout-sdk-app">
          <Heading as="h1">Sample SDK</Heading>
          <p>This is a react app which implements the Checkout SDK as a marketplace would.</p>
          <ConnectSDK></ConnectSDK>
        </main>
      </BiomeThemeProvider>
    )
}

export default SDK;