import {
  useAccount, useDisconnect, useEnsName,
} from 'wagmi';
import { useState } from 'react';
import { passportInstance } from '../utils';

export function Account() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });

  // setup the loading state to enable/disable buttons when loading
  const [loading, setLoadingState] = useState<boolean>(false);

  const passportLogout = async () => {
    // disable button while loading
    setLoadingState(true);
    // disconnect Wagmi from Passport
    disconnect();
    // logout from Passport
    await passportInstance.logout();
  };

  // render the view to show the connected accounts and logout
  return (
    <>
      <button
        className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
        onClick={() => passportLogout()}
        disabled={loading}
        type="button"
      >
        Passport Logout
      </button>
      <br />
      {loading
        ? <p>Loading...</p>
        : (
          <p>
            Connected Account:
            {address && <span>{ensName ? `${ensName} (${address})` : address}</span>}
          </p>
        )}
    </>
  );
}
