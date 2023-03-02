import './App.css';
import { BiomeThemeProvider, Heading, Button } from '@biom3/react'

function App () {
    return (
      <BiomeThemeProvider>
        <main className="checkout-sdk-app">
          <Heading as="h1">Sample App</Heading>
          <p>This is a react app which implements the CheckoutSDK and Widgets, choose which one you would like to preview.</p>
          <div className="button-container">
          <Button href={"/widgets"}>Widgets</Button>
          <Button href={"/sdk"}>SDK</Button>
          </div>
          
        </main>
      </BiomeThemeProvider>
    )
}

export default App;