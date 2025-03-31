'use client';
import React, { useEffect, useState } from 'react';
import { Heading, Link, Button, Card, Stack, Body, Divider, Badge, Table } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupDefault';

export default function EventHandlingPage() {
  const [connectionStatus, setConnectionStatus] = useState('Not connected');
  const [eventLogs, setEventLogs] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Log event helper function
  const logEvent = (eventName: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    let message = `${timestamp}: ${eventName}`;
    if (data) message += ` - ${JSON.stringify(data)}`;
    
    setEventLogs(prevLogs => [message, ...prevLogs.slice(0, 9)]); // Keep last 10 events
  };

  // Check initial connection status
  useEffect(() => {
    const checkConnection = async () => {
      if (!passportInstance) {
        setError('Passport instance not initialized');
        return;
      }

      try {
        // Check if user is logged in
        try {
          const provider = await passportInstance.connectEvm();
          if (provider) {
            const accounts = await provider.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
              setUserAddress(accounts[0]);
              setConnectionStatus('Connected');
              
              const chainIdResult = await provider.request({ method: 'eth_chainId' });
              setChainId(chainIdResult);
            } else {
              setConnectionStatus('Not connected');
            }
          }
        } catch (e) {
          console.error('Error getting user info:', e);
          setConnectionStatus('Not connected');
        }
      } catch (e) {
        console.error('Error checking authentication:', e);
        setError(`Authentication check failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    };

    checkConnection();
  }, []);

  // Setup event listeners
  useEffect(() => {
    if (!passportInstance) return;

    const setupEventListeners = async () => {
      try {
        const provider = await passportInstance.connectEvm();
        if (!provider) {
          console.error('Provider not available');
          return;
        }

        // Handle connect events
        const handleConnect = (connectInfo: any) => {
          logEvent('connect', connectInfo);
          setConnectionStatus('Connected');
        };

        // Handle disconnect events
        const handleDisconnect = (error: any) => {
          logEvent('disconnect', error);
          setConnectionStatus('Disconnected');
          setUserAddress(null);
          setChainId(null);
        };

        // Handle chainChanged events
        const handleChainChanged = (chainId: string) => {
          logEvent('chainChanged', { chainId });
          setChainId(chainId);
          // Best practice is to reload the page on chain change
          // window.location.reload();
        };

        // Handle accountsChanged events
        const handleAccountsChanged = (accounts: string[]) => {
          logEvent('accountsChanged', { accounts });
          if (accounts.length === 0) {
            setUserAddress(null);
            setConnectionStatus('Disconnected');
          } else {
            setUserAddress(accounts[0]);
          }
        };

        // Handle message events
        const handleMessage = (message: any) => {
          logEvent('message', message);
        };

        // Register event listeners
        provider.on('connect', handleConnect);
        provider.on('disconnect', handleDisconnect);
        provider.on('chainChanged', handleChainChanged);
        provider.on('accountsChanged', handleAccountsChanged);
        provider.on('message', handleMessage);

        logEvent('Event listeners registered');

        // Cleanup function to remove event listeners
        return () => {
          if (provider) {
            provider.removeListener('connect', handleConnect);
            provider.removeListener('disconnect', handleDisconnect);
            provider.removeListener('chainChanged', handleChainChanged);
            provider.removeListener('accountsChanged', handleAccountsChanged);
            provider.removeListener('message', handleMessage);
            logEvent('Event listeners removed');
          }
        };
      } catch (e) {
        console.error('Error setting up event listeners:', e);
        setError(`Failed to setup event listeners: ${e instanceof Error ? e.message : String(e)}`);
      }
    };

    setupEventListeners();
  }, []);

  // Connect to passport
  const handleConnect = async () => {
    if (!passportInstance) {
      setError('Passport instance not initialized');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Login to Passport
      logEvent('Initiating Passport login');
      await passportInstance.login();
      
      // Connect to the EVM provider
      logEvent('Connecting to EVM provider');
      const provider = await passportInstance.connectEvm();
      
      if (provider) {
        // Request accounts
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        setUserAddress(accounts[0]);
        
        // Get chain ID
        const chainId = await provider.request({ method: 'eth_chainId' });
        setChainId(chainId);
        
        setConnectionStatus('Connected');
        logEvent('Connected successfully', { address: accounts[0], chainId });
      }
    } catch (e) {
      console.error('Connection error:', e);
      setError(`Connection failed: ${e instanceof Error ? e.message : String(e)}`);
      logEvent('Connection error', { error: e instanceof Error ? e.message : String(e) });
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect from passport
  const handleDisconnect = async () => {
    if (!passportInstance) {
      setError('Passport instance not initialized');
      return;
    }

    try {
      logEvent('Initiating logout');
      await passportInstance.logout();
      setConnectionStatus('Disconnected');
      setUserAddress(null);
      setChainId(null);
      logEvent('Disconnected successfully');
    } catch (e) {
      console.error('Disconnect error:', e);
      setError(`Disconnect failed: ${e instanceof Error ? e.message : String(e)}`);
      logEvent('Disconnect error', { error: e instanceof Error ? e.message : String(e) });
    }
  };

  return (
    <Stack gap="xl" alignItems="stretch" className="max-w-3xl mx-auto w-full">
      <Stack direction="row" justifyContent="space-between" alignItems="center" className="w-full mb-4">
        <Heading size="medium">Event Handling Example</Heading>
        <Link rc={<NextLink href="/" />}>Return Home</Link>
      </Stack>
      
      <Card className="p-6 w-full mb-4">
        <Stack gap="md" className="w-full">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Heading size="small">Connection Status</Heading>
            <Badge 
              className={connectionStatus === 'Connected' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
            >
              {connectionStatus}
            </Badge>
          </Stack>
          
          <Divider className="my-2" />
          
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.Cell>Attribute</Table.Cell>
                <Table.Cell>Value</Table.Cell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              <Table.Row>
                <Table.Cell><Body weight="bold">Wallet Address</Body></Table.Cell>
                <Table.Cell><Body size="small" className="font-mono break-all">{userAddress || 'Not connected'}</Body></Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell><Body weight="bold">Chain ID</Body></Table.Cell>
                <Table.Cell><Body size="small" className="font-mono">{chainId || 'Not available'}</Body></Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
          
          <Stack direction="row" gap="md" className="mt-2">
            {connectionStatus !== 'Connected' ? (
              <Button 
                onClick={handleConnect} 
                disabled={isConnecting}
                variant="primary"
                size="medium"
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            ) : (
              <Button 
                onClick={handleDisconnect} 
                variant="secondary"
                size="medium"
              >
                Disconnect
              </Button>
            )}
          </Stack>

          {error && (
            <Body size="small" className="text-red-500 mt-2">{error}</Body>
          )}
        </Stack>
      </Card>
      
      <Card className="p-6 w-full">
        <Stack gap="md" className="w-full">
          <Heading size="small">Event Log</Heading>
          <Divider className="my-2" />
          
          {eventLogs.length > 0 ? (
            <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50">
              {eventLogs.map((log, index) => (
                <div key={index} className="py-1 font-mono text-sm break-all">
                  {log}
                </div>
              ))}
            </div>
          ) : (
            <Body size="small" className="text-gray-500">No events recorded yet.</Body>
          )}
        </Stack>
      </Card>
    </Stack>
  );
} 