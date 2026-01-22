import { useState, useEffect } from 'react';
import { Connector, useConnect } from 'wagmi';
import { Button } from '@biom3/react';

export function WalletOptions() {
  // get the available connectors and the connect function from Wagmi
  const { connectors, connect } = useConnect();

  // setup the filtered connectors state
  const [filteredConnectors, setFilteredConnectors] = useState<Connector[]>([]);

  // setup the loading state to enable/disable buttons when loading
  const [loading, setLoadingState] = useState<boolean>(true);

  useEffect(() => {
    if (!connectors) return;
    // filter the available connectors to show only Passport
    const filtered = connectors.filter((connector) => connector.name.includes('Immutable Passport'));
    setFilteredConnectors(filtered);
    // only enable button when we have found the Passport connector
    if (filtered.length > 0) {
      setLoadingState(false);
    }
  }, [connectors]);

  function passportLogin(connector:Connector) {
    // disable button while loading
    setLoadingState(true);
    // connect Wagmi to Passport
    connect({ connector });
  }

  // render the view to show login
  return (
    <>
      {filteredConnectors.map((connector) => (
        <>
        <p>Connect with:</p>
        <Button
          className="mb-1"
          key={connector.uid}
          type="button"
          onClick={() => passportLogin(connector)}
          disabled={loading}
        >
          {connector.name}
        </Button>
        </>
      ))}

      {loading && (
        <>
          <p>Loading...</p>
        </>
        )}
    </>
  );
}
