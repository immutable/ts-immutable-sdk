'use client';

import { useState } from 'react';
import { Button, Card, Heading, Stack, Table, Link, TextInput } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupDefault';

export default function GuardianMessages() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('Hello, Immutable!');
  const [signatureStatus, setSignatureStatus] = useState<string>('');
  const [signature, setSignature] = useState<string | null>(null);
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

  // Sign a message with Guardian evaluation
  const signMessage = async () => {
    if (!passportInstance || !isLoggedIn || !accountAddress || !message) {
      addLog('Please login and enter a message first');
      return;
    }

    try {
      addLog('Preparing message signing...');
      setSignatureStatus('Preparing');
      setSignature(null);
      
      const provider = await passportInstance.connectEvm();
      
      // Create the message to sign
      const msgParams = message;

      addLog('Signing message...');
      setSignatureStatus('Evaluating');
      
      // Guardian will evaluate the signature request
      const sig = await provider.request({
        method: 'personal_sign',
        params: [msgParams, accountAddress],
      });
      
      setSignatureStatus('Completed');
      setSignature(sig);
      addLog(`Message signed: ${sig}`);
    } catch (error) {
      console.error('Signature error:', error);
      setSignatureStatus('Failed');
      setSignature(null);
      addLog(`Signature failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <Stack direction="column" gap="medium" className="max-w-4xl mx-auto p-6">
      <Heading size="large">Guardian Message Signing</Heading>
      <p>This example demonstrates how Guardian evaluates message signing requests for security.</p>
      
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
          <Heading size="medium">Step 2: Sign Message with Guardian Protection</Heading>
          <p>Enter a message to sign. Guardian will evaluate the request for security.</p>
          
          <TextInput
            label="Message to Sign"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!isLoggedIn}
          />
          
          <Button
            className="mb-4"
            size="medium"
            onClick={signMessage}
            disabled={!isLoggedIn || !message}>
            Sign Message
          </Button>
          
          <Heading size="small">Signature Status: {signatureStatus || 'Not Started'}</Heading>
          
          {signature && (
            <div className="border rounded p-3 bg-gray-100 break-all">
              <p><b>Signature:</b></p>
              <p>{signature}</p>
            </div>
          )}
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