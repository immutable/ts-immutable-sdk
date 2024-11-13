'use client';

import { ethers, TypedDataEncoder } from 'ethers';
import { passport } from '@imtbl/sdk';
import { getEtherMailTypedPayload } from '../utils/etherMailTypedPayload'
import { isValidSignature } from '../utils/isValidSignature'
import { Button, Heading, Link, Table } from '@biom3/react';
import NextLink from 'next/link';
import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { BrowserProvider } from 'ethers';
import { Provider } from '@imtbl/sdk/passport';
import { passportInstance } from '../utils/passport';

export default function ConnectWithEtherJS() {
  // setup the accounts state
  const [accountsState, setAccountsState] = useState<any>([]);

  // setup the loading state to enable/disable buttons when loading
  const [loading, setLoadingState] = useState<boolean>(false);

  const [loggingOut, setLoggingOut] = useState<boolean>(false);

  // setup the signed/verified states to show messages on success or failure
  const [signedStateMessage, setSignedMessageState] = useState<string>('(not signed)');

  const [verifiedStateMessage, setVerifiedStateMessage] = useState<string>('(not verified)');

  // setup necessary states for verifying messages (params - address, payload; signature)
  const [params, setParams] = useState<any[]>([]);

  const [signature, setSignature] = useState<any>('');
  // #doc passport-wallets-nextjs-sign-eip712-create
  
  // fetch the Passport provider from the Passport instance
  const [passportProvider, setPassportProvider] = useState<Provider>();

  useEffect(() => {
    const fetchPassportProvider = async () => {
      const passportProvider = await passportInstance.connectEvm();
      setPassportProvider(passportProvider);
    };
    fetchPassportProvider();
  }, []);

  // create the BrowserProvider using the Passport provider
  const web3Provider = useMemo(() => passportProvider ? new BrowserProvider(passportProvider) : undefined, [passportProvider]);
  // #enddoc passport-wallets-nextjs-sign-eip712-create

  const passportLogin = async () => {
    if (web3Provider?.send) {
      // disable button while loading
      setLoadingState(true);

      // #doc passport-wallets-nextjs-sign-eip712-request
      // calling eth_requestAccounts triggers the Passport login flow
      const accounts = await web3Provider.send('eth_requestAccounts', []);
      // #enddoc passport-wallets-nextjs-sign-eip712-request

      // once logged in Passport is connected to the wallet and ready to transact
      setAccountsState(accounts);

      // enable button when loading has finished
      setLoadingState(false);
    }
  };

  const passportLogout = async () => {
    // disable button while loading
    setLoadingState(true);

    // hide table during logout
    setLoggingOut(true)

    // reset states
    setAccountsState([]);
    setParams([]);
    setSignature('');
    
    // logout from passport
    await passportInstance.logout();
  };


  // #doc passport-wallets-nextjs-sign-eip712-signmessage
  const signMessage = async () => {
    if (!web3Provider) return;

    // set signed state message to pending in the view
    setSignedMessageState('pending signature');

    // fetch the signer from the Web3provider
    const signer = await web3Provider.getSigner();

    // set the chainId
    const chainId = 13473; // zkEVM testnet

    // set the sender address
    const address = await signer.getAddress();

    // get our message payload - including domain, message and types (see utils/etherMailTypedPayload)
    const etherMailTypedPayload = getEtherMailTypedPayload(chainId, address)

    setParams([
      address,
      etherMailTypedPayload
    ])

    try {
      // attempt to sign the message, this brings up the passport popup
      // if successful update the signed message to successful in the view
      const signature = await passportProvider?.request({
        method: 'eth_signTypedData_v4',
        params: [address, etherMailTypedPayload],
      })
      
      setSignature(signature)
      setSignedMessageState('user successfully signed message');

    } catch (error: any) {
      // Handle user denying signature
      if (error.code === 4001) {
        // if the user declined update the signed message to declined in the view
        setSignedMessageState('user declined to sign');
      } else {
        // if something else went wrong, update the generic error with message in the view
        setSignedMessageState(`something went wrong - ${error.message}`);
        console.log(error);
      }
    }
  };
  // #enddoc passport-wallets-nextjs-sign-eip712-signmessage

  // #doc passport-wallets-nextjs-sign-eip712-verifysignature
  
  const isValidTypedDataSignature = async (
    address: string, //The Passport wallet address returned from eth_requestAccounts
    payload: string, //The stringified payload
    signature: string, //The signature
    zkEvmProvider: passport.Provider, // can be any provider, Passport or not
  ) => {
    const typedPayload: passport.TypedDataPayload = JSON.parse(payload);
    const types = { ...typedPayload.types };
    // @ts-ignore
    // Ethers auto-generates the EIP712Domain type in the TypedDataEncoder, and so it needs to be removed
    delete types.EIP712Domain;
  
    //The hashed string
    const digest = TypedDataEncoder.hash(
      typedPayload.domain,
      types,
      typedPayload.message,
    );
    return isValidSignature(address, digest, signature, zkEvmProvider);
  };

  const verifySignature = async () => {
    setVerifiedStateMessage("Pending Verification");

    try {
      if (!passportProvider) {
        throw new Error('Passport provider not available');
      }

      // validate the signature
      const isValid = await isValidTypedDataSignature(
        params[0], // the signer address
        JSON.stringify(params[1]), // the etherMail payload
        signature,
        passportProvider,
      );

      // set verified message state based on validation value
      isValid ? setVerifiedStateMessage("Signature verified") : setVerifiedStateMessage("Signature couldn't be verified");

    } catch (error: any) {
      // if something else went wrong, update the generic error with message in the view
      setSignedMessageState(`something went wrong - ${error.message}`);
      console.log(error);
    }
  }
  
  // #enddoc passport-wallets-nextjs-sign-eip712-verifysignature


  // render the view to login/logout and show the connected accounts and sign message
  return (
      <>
      <Heading className="mb-1">Passport Sign EIP-712 Message</Heading>
      {(accountsState.length === 0 && !loggingOut) 
      && (
      <Button
        className="mb-1"
        size="medium"
        onClick={passportLogin}
        disabled={loading}
      >
        Passport Login
      </Button>
      )}
      {accountsState.length >= 1 && (
      <>
        <p>
          <Button
            className="mb-1"
            size="medium"
            onClick={signMessage}
            disabled={loading}
          >
            Sign Message
          </Button>
        </p>
        <p>
          Message Signed: {signedStateMessage}
        </p>
        <br />
        <p>
          <Button
            className="mb-1"
            size="medium"
            onClick={verifySignature}
            disabled={loading || !signature}
          >
            Verify Signature
          </Button>
        </p>
        <p>
          Message Verified: {verifiedStateMessage}
        </p>
        <br />
        <p>
          <Button
            className="mb-1"
            onClick={passportLogout}
            disabled={loading}
          >
            Passport Logout
          </Button>
        </p>
      </>
      )}
      <br />

      {loggingOut ? (
        <h1 className="text-3xl font-bold mb-8">Logging Out...</h1>
      ) : (
        <>
          <Table>
          <Table.Head>
            <Table.Row>
              <Table.Cell>Item</Table.Cell>
              <Table.Cell>Value</Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Cell><b>Connected Account</b></Table.Cell>
              <Table.Cell>
                {accountsState.length === 0 && (
                  <span>(not&nbsp;connected)</span>
                )
                }
                {accountsState.length > 0 && accountsState[0]}
              </Table.Cell>
            </Table.Row>
          </Table.Body>
          </Table>
          <br />
          <Link rc={<NextLink href="/" />}>Return to Examples</Link>
        </>
      )}
    </>
  );
}