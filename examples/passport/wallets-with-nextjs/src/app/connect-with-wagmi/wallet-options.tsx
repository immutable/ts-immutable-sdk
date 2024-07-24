import { useState, useEffect } from 'react'
import { Connector, useConnect } from 'wagmi'
export function WalletOptions() {

  // get the available connectors and the connect function from Wagmi
  const { connectors, connect } = useConnect()
    
  // setup the filtered connectors state
  const [filteredConnectors, setFilteredConnectors] = useState<Connector[]>([])
  
  // setup the loading state to enable/disable buttons when loading
  const [loading, setLoadingState] = useState<boolean>(true);

  useEffect(() => {
    if (!connectors) return
    // #doc passport-wallets-nextjs-connect-wagmi-filter
    //filter the available connectors to show only Passport
    const filteredConnectors = (connectors.filter((connector) => connector.name.includes('Immutable Passport')))
    // #enddoc passport-wallets-nextjs-connect-wagmi-filter
    setFilteredConnectors(filteredConnectors)
    // enable button when loading has finished
    setLoadingState(false)
  }, [connectors])

  function passportLogin(connector:Connector) {
    // disable button while loading
    setLoadingState(true)
    // connect Wagmi to Passport
    connect({connector})
  }
  
  // render the view to show login
  return (<>
    {filteredConnectors.map((connector) => (
      <button key={connector.uid} onClick={() => passportLogin(connector)} disabled={loading}>
        {connector.name}
      </button>
    ))}
    {loading && <p>Loading...</p>}
  </>)
  
}