import { useState, useEffect } from 'react'
import { Connector, useConnect } from 'wagmi'

export function WalletOptions() {
  const { connectors, connect } = useConnect()

  const [filteredConnectors, setFilteredConnectors] = useState<Connector[]>([])

  useEffect(() => {
    if (!connectors) return
    setFilteredConnectors(connectors.filter((connector) => !connector.name.includes('Injected')))
  }, [connectors])

  return filteredConnectors.map((connector) => (
    <button key={connector.uid} onClick={() => connect({ connector })}>
      {connector.name}
    </button>
  ))
}