import { useEffect, useState } from 'react';
import { usePassport } from '@imtbl/sdk/passport';
import { Button } from '@biom3/react';

export default function EventHandlingPage() {
  const passport = usePassport();
  const [events, setEvents] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setEvents(prev => [...prev, 'Connected to wallet']);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setEvents(prev => [...prev, 'Disconnected from wallet']);
    };

    const handleAccountChange = (accounts: string[]) => {
      setEvents(prev => [...prev, `Account changed to: ${accounts[0]}`]);
    };

    const handleNetworkChange = (chainId: string) => {
      setEvents(prev => [...prev, `Network changed to chain ID: ${chainId}`]);
    };

    // Add event listeners
    passport.provider?.on('connect', handleConnect);
    passport.provider?.on('disconnect', handleDisconnect);
    passport.provider?.on('accountsChanged', handleAccountChange);
    passport.provider?.on('chainChanged', handleNetworkChange);

    // Cleanup event listeners
    return () => {
      passport.provider?.removeListener('connect', handleConnect);
      passport.provider?.removeListener('disconnect', handleDisconnect);
      passport.provider?.removeListener('accountsChanged', handleAccountChange);
      passport.provider?.removeListener('chainChanged', handleNetworkChange);
    };
  }, [passport.provider]);

  const handleConnect = async () => {
    try {
      await passport.connect();
    } catch (error) {
      setEvents(prev => [...prev, `Connection error: ${error.message}`]);
    }
  };

  const handleDisconnect = async () => {
    try {
      await passport.disconnect();
    } catch (error) {
      setEvents(prev => [...prev, `Disconnection error: ${error.message}`]);
    }
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Passport Event Handling Example</h1>
      
      <div className="space-x-4 mb-8">
        <Button
          onClick={handleConnect}
          disabled={isConnected}
          variant="primary"
        >
          Connect Passport
        </Button>
        
        <Button
          onClick={handleDisconnect}
          disabled={!isConnected}
          variant="secondary"
        >
          Disconnect
        </Button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Event Log</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          {events.length === 0 ? (
            <p>No events recorded yet. Try connecting your wallet!</p>
          ) : (
            <ul className="space-y-2">
              {events.map((event, index) => (
                <li key={index} className="border-b border-gray-200 pb-2">
                  {event}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
} 