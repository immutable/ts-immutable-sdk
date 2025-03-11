'use client';

import { useState, useEffect } from 'react';
import { Button, Heading, Table, Link, Card, Stack, Divider } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupDefault';

interface WalletProvider {
  name: string;
  icon?: string;
  providerId: string;
}

export default function ProviderAnnounce() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [discoveredProviders, setDiscoveredProviders] = useState<WalletProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [announcementMade, setAnnouncementMade] = useState<boolean>(false);

  // Listen for EIP-6963 provider announcements
  useEffect(() => {
    function handleProviderAnnouncement(event: any) {
      const { info } = event.detail;
      setDiscoveredProviders(prev => {
        // Check if provider already exists
        const exists = prev.some(p => p.providerId === info.uuid);
        if (exists) return prev;
        
        // Add new provider
        return [...prev, {
          name: info.name,
          icon: info.icon,
          providerId: info.uuid
        }];
      });
    }

    // Request providers and listen for announcements
    window.addEventListener('eip6963:announceProvider', handleProviderAnnouncement);
    window.dispatchEvent(new CustomEvent('eip6963:requestProvider'));

    return () => {
      window.removeEventListener('eip6963:announceProvider', handleProviderAnnouncement);
    };
  }, []);

  const announceProvider = async () => {
    if (!passportInstance) return;
    try {
      // Connect to EVM with announceProvider option set to true (default)
      await passportInstance.connectEvm({
        announceProvider: true
      });
      setAnnouncementMade(true);
    } catch (error) {
      console.error('Error announcing provider:', error);
    }
  };

  const loginWithPassport = async (announceOnly = false) => {
    if (!passportInstance) return;
    try {
      // Connect to EVM with provider announcement configurable
      const provider = await passportInstance.connectEvm({
        announceProvider: true
      });
      
      if (!announceOnly) {
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        if (accounts) {
          setIsLoggedIn(true);
          setAccountAddress(accounts[0] || null);
          setSelectedProvider('Immutable Passport');
        } else {
          setIsLoggedIn(false);
        }
      }
    } catch (error) {
      console.error('Error connecting to Passport:', error);
      setIsLoggedIn(false);
    }
  };

  const logout = async () => {
    if (!passportInstance) return;
    try {
      await passportInstance.logout({
        redirectMode: 'silent'
      });
      setIsLoggedIn(false);
      setAccountAddress(null);
      setSelectedProvider(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Stack spacing="xl" alignItems="center" className="info-container">
      <Heading size="medium" className="mb-1">
        EIP-6963 Provider Announcement
      </Heading>
      
      <Card>
        <h2>Provider Configuration</h2>
        <Stack direction="horizontal" spacing="md">
          <Button
            className="mb-1"
            size="medium"
            onClick={() => announceProvider()}
            disabled={announcementMade}>
            Announce Provider Only
          </Button>

          <Button
            className="mb-1"
            size="medium"
            onClick={() => loginWithPassport(false)}
            disabled={isLoggedIn}>
            Login with Provider
          </Button>

          <Button
            className="mb-1"
            size="medium"
            variant="tertiary"
            onClick={logout}
            disabled={!isLoggedIn}>
            Logout
          </Button>
        </Stack>
      </Card>

      <Divider />
      
      <Card>
        <h2>Wallet Discovery</h2>
        <p>Discovered providers ({discoveredProviders.length}):</p>
        
        {discoveredProviders.length > 0 ? (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.Cell>Provider</Table.Cell>
                <Table.Cell>ID</Table.Cell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {discoveredProviders.map((provider) => (
                <Table.Row key={provider.providerId}>
                  <Table.Cell>{provider.name}</Table.Cell>
                  <Table.Cell>{provider.providerId.substring(0, 8)}...</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        ) : (
          <p>No providers discovered yet. Click "Announce Provider Only" button to announce Passport as a provider.</p>
        )}
      </Card>

      <Divider />

      <Card>
        <h2>Connection Status</h2>
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
              <Table.Cell><b>Selected Provider</b></Table.Cell>
              <Table.Cell>{selectedProvider || 'None'}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell><b>Account Address</b></Table.Cell>
              <Table.Cell>{accountAddress || 'N/A'}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </Card>

      <Link rc={<NextLink href="/" />}>Return to Home</Link>
    </Stack>
  );
} 