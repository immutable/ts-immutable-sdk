'use client';

import { useState, useEffect } from 'react';
import { Button, Stack, Table } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupDefault';
import localforage from 'localforage';

// Create a second instance to demonstrate cross-SDK bridge
const secondInstance = localforage.createInstance({
  name: 'SecondSDKInstance',
  storeName: 'bridgeDemo'
});

export default function LoginWithBridge() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [storedData, setStoredData] = useState<string | null>(null);
  const [bridgeMessage, setBridgeMessage] = useState<string>('');

  // Check if user is already logged in
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userProfile = await passportInstance.getUserInfo();
        if (userProfile && userProfile.sub) {
          setIsLoggedIn(true);
          setUserId(userProfile.sub);
          
          // Try to get the address if already connected
          try {
            const provider = await passportInstance.connectEvm({ silent: true });
            const accounts = await provider.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
              setAccountAddress(accounts[0]);
            }
          } catch (error) {
            console.log('No connected accounts yet');
          }
        }
      } catch (error) {
        console.log('User not logged in');
      }
    };

    checkLoginStatus();
  }, []);

  // Check for any saved data in IndexedDB
  useEffect(() => {
    const checkStoredData = async () => {
      try {
        // Access the browser's IndexedDB directly
        const data = await localforage.getItem('passport-test-data');
        if (data) {
          setStoredData(String(data));
        }
      } catch (error) {
        console.error('Error accessing stored data:', error);
      }
    };

    checkStoredData();
  }, [isLoggedIn]);

  const loginWithPassport = async () => {
    if (!passportInstance) return;
    try {
      // Login and connect to EVM
      const provider = await passportInstance.connectEvm();
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      
      if (accounts) {
        setIsLoggedIn(true);
        setAccountAddress(accounts[0] || null);
        
        // Get user info
        const userProfile = await passportInstance.getUserInfo();
        if (userProfile && userProfile.sub) {
          setUserId(userProfile.sub);
        }
      }
    } catch (error) {
      console.error('Error connecting to Passport:', error);
    }
  };
  
  const storeDataInIndexedDB = async () => {
    if (!isLoggedIn) {
      alert('Please login first');
      return;
    }
    
    const timestamp = new Date().toISOString();
    const dataToStore = `Data saved by user ${userId} at ${timestamp}`;
    
    try {
      // Store data in the default IndexedDB instance used by Passport
      await localforage.setItem('passport-test-data', dataToStore);
      setStoredData(dataToStore);
      setBridgeMessage('Data successfully stored in IndexedDB!');
    } catch (error) {
      console.error('Error storing data:', error);
      setBridgeMessage('Failed to store data in IndexedDB.');
    }
  };
  
  const accessFromSecondInstance = async () => {
    if (!storedData) {
      setBridgeMessage('No data found. Please store data first.');
      return;
    }
    
    try {
      // Store a reference in a second IndexedDB instance
      await secondInstance.setItem('reference-to-passport-data', 'Second instance knows about: ' + storedData);
      
      // Retrieve it to demonstrate it's accessible
      const secondInstanceData = await secondInstance.getItem('reference-to-passport-data');
      setBridgeMessage(`Second SDK instance says: ${secondInstanceData}`);
    } catch (error) {
      console.error('Error with second instance:', error);
      setBridgeMessage('Failed to access from second instance.');
    }
  };
  
  const clearAllData = async () => {
    try {
      await localforage.clear();
      await secondInstance.clear();
      setStoredData(null);
      setBridgeMessage('All data cleared from IndexedDB');
    } catch (error) {
      console.error('Error clearing data:', error);
      setBridgeMessage('Failed to clear data');
    }
  };

  return (
    <Stack direction="column" alignItems="center" gap="spacing5" className="bridge-container">
      <h1>Cross-SDK Bridge Example</h1>
      
      <Button
        className="mb-1"
        size="medium"
        onClick={loginWithPassport}
        disabled={isLoggedIn}>
        {isLoggedIn ? 'Logged In' : 'Login with Passport'}
      </Button>

      <h2>Authentication Status</h2>
      <Table>
        <Table.Head>
          <Table.Row>
            <Table.Cell>Attribute</Table.Cell>
            <Table.Cell>Value</Table.Cell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell><b>Is Logged In</b></Table.Cell>
            <Table.Cell>{isLoggedIn ? 'Yes' : 'No'}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell><b>User ID</b></Table.Cell>
            <Table.Cell>{userId || 'N/A'}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell><b>Account Address</b></Table.Cell>
            <Table.Cell>{accountAddress || 'N/A'}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      
      <h2>Cross-SDK Bridge Feature</h2>
      <p>Test the IndexedDB storage integration for cross-SDK data persistence:</p>
      
      <Stack direction="column" gap="spacing3" className="mb-1">
        <Button
          size="medium"
          onClick={storeDataInIndexedDB}
          disabled={!isLoggedIn}>
          Store Data in IndexedDB
        </Button>
        
        <Button
          size="medium"
          onClick={accessFromSecondInstance}
          disabled={!storedData}>
          Access Data from Second SDK Instance
        </Button>
        
        <Button
          size="medium"
          onClick={clearAllData}>
          Clear All Stored Data
        </Button>
      </Stack>
      
      <h3>Bridge Status</h3>
      {bridgeMessage && <p>{bridgeMessage}</p>}
      
      <h3>Stored Data</h3>
      <p>{storedData || 'No data stored yet'}</p>
      
      <Button
        className="mt-1"
        size="medium"
        rc={<NextLink href="/" />}>
        Return to Home
      </Button>
    </Stack>
  );
} 