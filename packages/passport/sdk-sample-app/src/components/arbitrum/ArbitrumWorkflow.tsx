import React, { useState } from 'react';
import { Stack } from 'react-bootstrap';
import { usePassportProvider } from '@/context/PassportProvider';
import Request from '@/components/arbitrum/Request';
import CardStack from '@/components/CardStack';
import { useStatusProvider } from '@/context/StatusProvider';
import WorkflowButton from '@/components/WorkflowButton';

function ArbitrumWorkflow() {
  const [showRequest, setShowRequest] = useState<boolean>(false);

  const { isLoading } = useStatusProvider();
  const { connectArbitrum, arbitrumProvider } = usePassportProvider();

  const handleRequest = () => {
    setShowRequest(true);
  };

  return (
    <CardStack title="Arbitrum One Workflow">
      <Stack direction="horizontal" style={{ flexWrap: 'wrap' }} gap={3}>
        {arbitrumProvider && (
          <>
            <WorkflowButton
              disabled={isLoading}
              onClick={handleRequest}
            >
              request
            </WorkflowButton>
            {showRequest && (
              <Request
                showModal={showRequest}
                setShowModal={setShowRequest}
              />
            )}
          </>
        )}
        {!arbitrumProvider && (
          <WorkflowButton
            disabled={isLoading}
            onClick={connectArbitrum}
          >
            Connect Arbitrum
          </WorkflowButton>
        )}
      </Stack>
    </CardStack>
  );
}

export default ArbitrumWorkflow;
