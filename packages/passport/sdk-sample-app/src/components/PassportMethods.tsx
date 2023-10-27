import React from 'react';
import { Stack } from 'react-bootstrap';
import { useStatusProvider } from '@/context/StatusProvider';
import { usePassportProvider } from '@/context/PassportProvider';
import CardStack from '@/components/CardStack';
import WorkflowButton from '@/components/WorkflowButton';

function PassportMethods() {
  const { isLoading } = useStatusProvider();
  const {
    userProfile,
    logout,
    signIn,
    getIdToken,
    getAccessToken,
    getUserInfo,
    getLinkedAddresses,
  } = usePassportProvider();

  return (
    <CardStack title="Passport Methods">
      <Stack direction="horizontal" style={{ flexWrap: 'wrap' }} gap={3}>
        {!userProfile && (
        <WorkflowButton
          disabled={isLoading}
          onClick={signIn}
        >
          Login
        </WorkflowButton>
        )}
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
      </Stack>
    </CardStack>
  );
}

export default PassportMethods;
