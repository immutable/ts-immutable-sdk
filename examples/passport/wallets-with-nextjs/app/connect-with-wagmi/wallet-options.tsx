import { useState, useEffect } from 'react'
import { Connector, useConnect } from 'wagmi'

export function WalletOptions() {
  const { connectors, connect } = useConnect()
  
  // setup the loading state to enable/disable buttons when loading
  const [loading, setLoadingState] = useState<boolean>(true);
  
  const [filteredConnectors, setFilteredConnectors] = useState<Connector[]>([])

  //filter 
  useEffect(() => {
    if (!connectors) return
    setFilteredConnectors(connectors.filter((connector) => connector.name.includes('Immutable Passport')))
    setLoadingState(false)
}, [connectors])

  return (<>
  {!loading && filteredConnectors.map((connector) => (
    <button key={connector.uid} onClick={() => connect({ connector })}>
      {connector.name}
    </button>
  ))}
  {loading && <p>Loading...</p>}
  </>)
  
}