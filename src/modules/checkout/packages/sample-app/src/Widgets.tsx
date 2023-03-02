import ConnectUI from './components/ui/connect/connect';
import { BiomeThemeProvider, Heading } from '@biom3/react'

function Widgets () {
    return (
      <BiomeThemeProvider>
        <main className="checkout-sdk-app">
          <Heading as="h1">Sample Widgets</Heading>
          <p>This is a react app which implements the UI widgets as a marketplace would.</p>
          <ConnectUI></ConnectUI>
        </main>
      </BiomeThemeProvider>
    )
}

export default Widgets;