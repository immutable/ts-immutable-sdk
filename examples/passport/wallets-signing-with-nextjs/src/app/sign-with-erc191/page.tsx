'use client';
 
import { useState } from 'react';
import { ethers } from 'ethers';
import { passportInstance } from '../utils';

export default function ConnectWithEtherJS() {
  
  // setup the accounts state
  const [accountsState, setAccountsState] = useState<any>([]);

  // setup the loading state to enable/disable buttons when loading
  const [loading, setLoadingState] = useState<boolean>(false);

  // setup the signed state to show messages on success or failure of signing
  const [signedStateMessage, setSignedMessageState] = useState<string>("(not signed)");

  // #doc passport-wallets-nextjs-sign-erc191-create
  // fetch the Passport provider from the Passport instance
  const passportProvider = passportInstance.connectEvm()

  // create the Web3Provider using the Passport provider
  const web3Provider = new ethers.providers.Web3Provider(passportProvider);
  // #enddoc passport-wallets-nextjs-sign-erc191-create

  const passportLogin = async () => {
    if (web3Provider.provider.request) {
      // disable button while loading
      setLoadingState(true)
      
      // #doc passport-wallets-nextjs-sign-erc191-request
      // calling eth_requestAccounts triggers the Passport login flow
      const accounts = await web3Provider.provider.request({ method: "eth_requestAccounts" });
      // #enddoc passport-wallets-nextjs-sign-erc191-request

      // once logged in Passport is connected to the wallet and ready to transact
      setAccountsState(accounts)
      // enable button when loading has finished
      setLoadingState(false)
    }
  }

  const passportLogout = async () => {
     // disable button while loading
     setLoadingState(true)
     // reset the account state
     setAccountsState([])
     // logout from passport
     await passportInstance.logout()
  }

  // #doc passport-wallets-nextjs-sign-erc191-signmessage
  const signMessage = async () => {
    // set signed state message to pending in the view
    setSignedMessageState('pending signature')

    // fetch the signer from the Web3provider
    const signer = web3Provider.getSigner();

    // Create the message to be signed
    // Please note there is a 500 character limit for the message
    const message = "this is a personal sign message";

    let signature: string;
    try {
      // attempt to sign the message, this brings up the passport popup
      signature = await signer.signMessage(message);
      
      // if successful update the signed message to successful in the view
      setSignedMessageState('user successfully signed message')
    } catch (error: any) {
      // Handle user denying signature
      if (error.code === -32003) {
        // if the user declined update the signed message to declined in the view
        setSignedMessageState('user declined to sign')
      } else {
        // if something else went wrong, update the generic error with message in the view
        setSignedMessageState(`something went wrong - ${error.message}`)
      }
    }
  }
  // #enddoc passport-wallets-nextjs-sign-erc191-signmessage

  // render the view to login/logout and show the connected accounts and sign message
  return (<>
    <h1>Passport Wallets - Sign ERC-191 message</h1>
    {accountsState.length == 0 && 
      <button onClick={passportLogin} disabled={loading}>Passport Login</button>
    }
    {accountsState.length >= 1 && <>
        <p>
          <button onClick={signMessage} disabled={loading}>Sign Message</button>
        </p>
        <p>Message Signed: {signedStateMessage}</p>
        <p>
          <button onClick={passportLogout} disabled={loading}>Passport Logout</button>
        </p>
      </>
    }
    {loading 
      ? <p>Loading...</p> 
      : <p>Connected Account: {accountsState.length >= 1 ? accountsState : '(not connected)'}</p>
    }
    <p>
      <a href="/">Return to Examples</a>
    </p>
  </>);
}
