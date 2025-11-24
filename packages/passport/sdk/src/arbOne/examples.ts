/**
 * Example usage of Arbitrum One provider with Sequence wallet integration
 * 
 * This file contains examples of how to use the ArbOneProvider to interact
 * with Arbitrum One using Passport authentication and Sequence wallet infrastructure.
 */

import { Environment } from '@imtbl/config';
import { Passport, EvmChain } from '../index';

// ============================================================================
// Example 1: Basic Connection to Arbitrum One
// ============================================================================

export async function connectToArbOne() {
  const passport = new Passport({
    baseConfig: { environment: Environment.SANDBOX },
    clientId: 'YOUR_CLIENT_ID',
    redirectUri: 'http://localhost:3000/callback',
  });

  // Connect to Arbitrum One
  const provider = await passport.connectEvm({
    announceProvider: true,
    chain: EvmChain.ARBONE,
  });

  // Request accounts (triggers login if not already logged in)
  const accounts = await provider.request({
    method: 'eth_requestAccounts',
  });

  console.log('Connected to Arbitrum One with account:', accounts[0]);
  return { passport, provider, accounts };
}

// ============================================================================
// Example 2: Sending a Transaction
// ============================================================================

export async function sendTransaction() {
  const { provider, accounts } = await connectToArbOne();

  const txHash = await provider.request({
    method: 'eth_sendTransaction',
    params: [{
      from: accounts[0],
      to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      value: '0x29a2241af62c0000', // 0.005 ETH in hex
      data: '0x',
    }],
  });

  console.log('Transaction sent:', txHash);
  return txHash;
}

// ============================================================================
// Example 3: Getting Account Balance
// ============================================================================

export async function getBalance() {
  const { provider, accounts } = await connectToArbOne();

  const balance = await provider.request({
    method: 'eth_getBalance',
    params: [accounts[0], 'latest'],
  });

  console.log('Balance:', balance);
  return balance;
}

// ============================================================================
// Example 4: Personal Sign
// ============================================================================

export async function signMessage() {
  const { provider, accounts } = await connectToArbOne();

  const message = 'Hello from Arbitrum One!';
  
  const signature = await provider.request({
    method: 'personal_sign',
    params: [message, accounts[0]],
  });

  console.log('Message signed:', signature);
  return signature;
}

// ============================================================================
// Example 5: Sign Typed Data (EIP-712)
// ============================================================================

export async function signTypedData() {
  const { provider, accounts } = await connectToArbOne();

  const typedData = {
    domain: {
      name: 'My DApp',
      version: '1',
      chainId: 42161, // Arbitrum One mainnet
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
    },
    types: {
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' },
      ],
      Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person' },
        { name: 'contents', type: 'string' },
      ],
    },
    primaryType: 'Mail',
    message: {
      from: {
        name: 'Alice',
        wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
      },
      to: {
        name: 'Bob',
        wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
      },
      contents: 'Hello, Bob!',
    },
  };

  const signature = await provider.request({
    method: 'eth_signTypedData_v4',
    params: [accounts[0], JSON.stringify(typedData)],
  });

  console.log('Typed data signed:', signature);
  return signature;
}

// ============================================================================
// Example 6: Estimating Gas
// ============================================================================

export async function estimateGas() {
  const { provider, accounts } = await connectToArbOne();

  const gasEstimate = await provider.request({
    method: 'eth_estimateGas',
    params: [{
      from: accounts[0],
      to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      value: '0x29a2241af62c0000',
      data: '0x',
    }],
  });

  console.log('Estimated gas:', gasEstimate);
  return gasEstimate;
}

// ============================================================================
// Example 7: Calling a Contract (Read Operation)
// ============================================================================

export async function callContract() {
  const { provider } = await connectToArbOne();

  // Example: Reading totalSupply from an ERC20 contract
  const contractAddress = '0x...' // Your contract address
  const totalSupplySelector = '0x18160ddd'; // totalSupply() function selector

  const result = await provider.request({
    method: 'eth_call',
    params: [{
      to: contractAddress,
      data: totalSupplySelector,
    }, 'latest'],
  });

  console.log('Contract call result:', result);
  return result;
}

// ============================================================================
// Example 8: Getting Chain ID
// ============================================================================

export async function getChainId() {
  const { provider } = await connectToArbOne();

  const chainId = await provider.request({
    method: 'eth_chainId',
  });

  console.log('Chain ID:', chainId);
  return chainId;
}

// ============================================================================
// Example 9: Multi-Chain Application (zkEVM + Arbitrum One)
// ============================================================================

export async function multiChainExample() {
  const passport = new Passport({
    baseConfig: { environment: Environment.SANDBOX },
    clientId: 'YOUR_CLIENT_ID',
    redirectUri: 'http://localhost:3000/callback',
  });

  // Connect to zkEVM
  const zkEvmProvider = await passport.connectEvm({
    announceProvider: false,
    chain: EvmChain.ZKEVM,
  });

  const zkEvmAccounts = await zkEvmProvider.request({
    method: 'eth_requestAccounts',
  });

  console.log('zkEVM account:', zkEvmAccounts[0]);

  // Connect to Arbitrum One
  const arbOneProvider = await passport.connectEvm({
    announceProvider: false,
    chain: EvmChain.ARBONE,
  });

  const arbOneAccounts = await arbOneProvider.request({
    method: 'eth_requestAccounts',
  });

  console.log('Arbitrum One account:', arbOneAccounts[0]);

  return {
    zkEvm: { provider: zkEvmProvider, accounts: zkEvmAccounts },
    arbOne: { provider: arbOneProvider, accounts: arbOneAccounts },
  };
}

// ============================================================================
// Example 10: Listening to Events
// ============================================================================

export async function listenToEvents() {
  const { provider } = await connectToArbOne();

  // Listen for account changes
  provider.on('accountsChanged', (accounts: string[]) => {
    console.log('Accounts changed:', accounts);
  });

  // Listen for chain changes
  provider.on('chainChanged', (chainId: string) => {
    console.log('Chain changed:', chainId);
  });

  console.log('Event listeners registered');
}

// ============================================================================
// Example 11: Error Handling
// ============================================================================

export async function errorHandlingExample() {
  try {
    const { provider } = await connectToArbOne();

    // Try to send a transaction without proper parameters
    await provider.request({
      method: 'eth_sendTransaction',
      params: [{}], // Invalid parameters
    });
  } catch (error: any) {
    console.error('Error occurred:');
    console.error('- Code:', error.code);
    console.error('- Message:', error.message);
    
    // Handle specific error codes
    if (error.code === 4001) {
      console.log('User rejected the request');
    } else if (error.code === 4100) {
      console.log('Unauthorized - need to call eth_requestAccounts');
    } else if (error.code === 4200) {
      console.log('Method not supported');
    }
  }
}

// ============================================================================
// Example 12: Using with React
// ============================================================================

export function ReactExample() {
  // This is a conceptual example for React usage
  /*
  import { useState, useEffect } from 'react';
  import { Passport, EvmChain } from '@imtbl/passport';

  function ArbOneWallet() {
    const [provider, setProvider] = useState(null);
    const [account, setAccount] = useState('');

    useEffect(() => {
      const initPassport = async () => {
        const passport = new Passport({
          baseConfig: { environment: 'sandbox' },
          clientId: 'YOUR_CLIENT_ID',
          redirectUri: 'http://localhost:3000/callback',
        });

        const arbProvider = await passport.connectEvm({
          chain: EvmChain.ARBONE,
        });

        setProvider(arbProvider);

        // Listen to account changes
        arbProvider.on('accountsChanged', (accounts) => {
          setAccount(accounts[0] || '');
        });
      };

      initPassport();
    }, []);

    const connect = async () => {
      if (!provider) return;
      
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });
      
      setAccount(accounts[0]);
    };

    const sendTx = async () => {
      if (!provider || !account) return;

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          value: '0x29a2241af62c0000',
        }],
      });

      console.log('Transaction:', txHash);
    };

    return (
      <div>
        <button onClick={connect}>Connect Wallet</button>
        {account && (
          <>
            <p>Connected: {account}</p>
            <button onClick={sendTx}>Send Transaction</button>
          </>
        )}
      </div>
    );
  }
  */
}

