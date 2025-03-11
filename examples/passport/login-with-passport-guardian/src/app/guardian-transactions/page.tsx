'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Heading, Stack, Table, Link } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupDefault';

export default function GuardianTransactions() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<string>('');
  const [logMessages, setLogMessages] = useState<string[]>([]);

  // Helper to add log messages
  const addLog = (message: string) => {
    setLogMessages((prev) => [...prev, `${new Date().toISOString().slice(11, 19)} - ${message}`]);
  };

  // Login with Passport
  const loginWithPassport = async () => {
    if (!passportInstance) return;
    try {
      addLog('Connecting to Passport...');
      const provider = await passportInstance.connectEvm();
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      
      if (accounts && accounts.length > 0) {
        setIsLoggedIn(true);
        setAccountAddress(accounts[0] || null);
        addLog(`Connected with address: ${accounts[0]}`);
      } else {
        setIsLoggedIn(false);
        addLog('No accounts returned');
      }
    } catch (error) {
      console.error('Error connecting to Passport:', error);
      setIsLoggedIn(false);
      addLog(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Simulate a transaction that will be evaluated by Guardian
  const sendTransaction = async () => {
    if (!passportInstance || !isLoggedIn || !accountAddress) {
      addLog('Please login first');
      return;
    }

    try {
      addLog('Preparing transaction...');
      setTransactionStatus('Preparing');
      
      const provider = await passportInstance.connectEvm();
      
      // Create a simple transaction (transfer of 0 ETH)
      const transaction = {
        to: accountAddress, // Sending to self for demo
        value: '0x0', // 0 ETH
        data: '0x', // No data
      };

      addLog('Sending transaction...');
      setTransactionStatus('Evaluating');
      
      // This will trigger Guardian evaluation
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [transaction],
      });
      
      setTransactionStatus('Completed');
      addLog(`Transaction complete: ${txHash}`);
    } catch (error) {
      console.error('Transaction error:', error);
      setTransactionStatus('Failed');
      addLog(`Transaction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <Stack direction="column" gap="medium" className="max-w-4xl mx-auto p-6">
      <Heading size="large">Guardian Transaction Evaluation</Heading>
      <p>This example demonstrates how Guardian evaluates transactions for security.</p>
      
      <Card className="p-6">
        <Stack direction="column" gap="medium">
          <Heading size="medium">Step 1: Connect with Passport</Heading>
          <Button
            className="mb-4"
            size="medium"
            onClick={loginWithPassport}
            disabled={isLoggedIn}>
            {isLoggedIn ? 'Connected' : 'Connect'}
          </Button>

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
                <Table.Cell><b>Account Address</b></Table.Cell>
                <Table.Cell>{accountAddress || 'N/A'}</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </Stack>
      </Card>
      
      <Card className="p-6">
        <Stack direction="column" gap="medium">
          <Heading size="medium">Step 2: Send Transaction with Guardian Protection</Heading>
          <p>This will send a 0 ETH transaction that gets evaluated by Guardian.</p>
          <p>Guardian will automatically evaluate the transaction for security risks.</p>
          
          <Button
            className="mb-4"
            size="medium"
            onClick={sendTransaction}
            disabled={!isLoggedIn}>
            Send Test Transaction
          </Button>
          
          <Heading size="small">Transaction Status: {transactionStatus || 'Not Started'}</Heading>
        </Stack>
      </Card>
      
      <Card className="p-6">
        <Stack direction="column" gap="medium">
          <Heading size="medium">Activity Log</Heading>
          <div className="border rounded p-3 bg-gray-100 max-h-40 overflow-y-auto">
            {logMessages.length > 0 ? (
              logMessages.map((log, index) => (
                <div key={index} className="py-1">
                  {log}
                </div>
              ))
            ) : (
              <p>No activity yet</p>
            )}
          </div>
        </Stack>
      </Card>
      
      <Link rc={<NextLink href="/" />}>Return to Examples</Link>
    </Stack>
  );
} 