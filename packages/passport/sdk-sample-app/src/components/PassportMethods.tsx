import React, { useCallback, useState } from 'react';
import { Stack } from 'react-bootstrap';
import { useStatusProvider } from '@/context/StatusProvider';
import { usePassportProvider } from '@/context/PassportProvider';
import CardStack from '@/components/CardStack';
import WorkflowButton from '@/components/WorkflowButton';
import LinkWallet from '@/components/LinkWallet';

function PassportMethods() {
  const [showLinkWallet, setShowLinkWallet] = useState<boolean>(false);
  const { isLoading, addMessage } = useStatusProvider();
  const {
    logout,
    login,
    getIdToken,
    getAccessToken,
    getUserInfo,
    getLinkedAddresses,
    linkWallet,
  } = usePassportProvider();

  const handleLinkWalletClick = async () => {
    const userInfo = await getUserInfo();
    if (userInfo) {
      setShowLinkWallet(true);
    } else {
      console.error('Error checking login status');
    }
  };

  const handleLinkWalletSubmit = useCallback(async (
    type: string,
    walletAddress: string,
    signature: string,
    nonce: string,
  ) => {
    await linkWallet(type, walletAddress, signature, nonce);
    setShowLinkWallet(false);
  }, [linkWallet]);

  return (
    <CardStack title="Passport Methods">
      <Stack direction="horizontal" style={{ flexWrap: 'wrap' }} gap={3}>
        <WorkflowButton
          disabled={isLoading}
          onClick={login}
        >
          Login
        </WorkflowButton>
        <WorkflowButton
          disabled={isLoading}
          onClick={logout}
        >
          Logout
        </WorkflowButton>
        <WorkflowButton
          disabled={isLoading}
          onClick={getIdToken}
        >
          Get ID Token
        </WorkflowButton>
        <WorkflowButton
          disabled={isLoading}
          onClick={getAccessToken}
        >
          Get Access Token
        </WorkflowButton>
        <WorkflowButton
          disabled={isLoading}
          onClick={getUserInfo}
        >
          Get User Info
        </WorkflowButton>
        <WorkflowButton
          disabled={isLoading}
          onClick={getLinkedAddresses}
        >
          Get Linked Addresses
        </WorkflowButton>
        <WorkflowButton
          disabled={isLoading}
          onClick={handleLinkWalletClick}
        >
          Link Wallet
        </WorkflowButton>
      </Stack>
      {showLinkWallet && (
        <LinkWallet
          showModal={showLinkWallet}
          setShowModal={setShowLinkWallet}
          onSubmit={handleLinkWalletSubmit}
        />
      )}
    </CardStack>
  );
}

export default PassportMethods;
