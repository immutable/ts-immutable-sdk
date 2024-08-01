import { useState, useEffect } from 'react';
import { Connector, useConnect } from 'wagmi';

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
    setFilteredConnectors(connectors.filter((connector) => connector.name.includes('Immutable Passport')));
    // enable button when loading has finished
    setLoadingState(false);
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
        <button
          className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
          key={connector.uid}
          type="button"
          onClick={() => passportLogin(connector)}
          disabled={loading}
        >
          {connector.name}
        </button>
      ))}
      <br />
      {loading && <p>Loading...</p>}
    </>
  );
}
