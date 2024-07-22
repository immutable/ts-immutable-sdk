import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi'
import { passportInstance } from '../page';
import { useEffect, useState } from 'react';

export function Account() {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! })

  // setup the loading state to enable/disable buttons when loading
  const [loading, setLoadingState] = useState<boolean>(false);

  const passportLogout = async () => {
    // disable button while loading
    setLoadingState(true)
    // logout from Passport
    await passportInstance.logout()
    // disconnect Wagmi from Passport
    disconnect()
  }

  // render the view to show the connected accounts and logout
  return (
    <div>   
      <button onClick={() => passportLogout()} disabled={loading}>Passport Logout</button>
      {ensAvatar && <img alt="ENS Avatar" src={ensAvatar} />}
      {loading 
        ? <p>Loading...</p> 
        : <p>Connected Account: {address && <span>{ensName ? `${ensName} (${address})` : address}</span>}</p>
      }
    </div>
  )
}