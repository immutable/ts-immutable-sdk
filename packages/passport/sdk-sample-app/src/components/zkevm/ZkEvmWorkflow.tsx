import React, { useState } from 'react';
import { Stack } from 'react-bootstrap';
import { usePassportProvider } from '@/context/PassportProvider';
import Request from '@/components/zkevm/Request';
import CardStack from '@/components/CardStack';
import { useStatusProvider } from '@/context/StatusProvider';
import WorkflowButton from '@/components/WorkflowButton';

function ZkEvmWorkflow() {
  const [showRequest, setShowRequest] = useState<boolean>(false);

  const { isLoading } = useStatusProvider();
  const { connectZkEvm, zkEvmProvider } = usePassportProvider();

  const handleRequest = () => {
    setShowRequest(true);
  };

  return (
    <CardStack title="ZkEvm Workflow">
      <Stack direction="horizontal" style={{ flexWrap: 'wrap' }} gap={3}>
        {zkEvmProvider && (
          <>
            <WorkflowButton
              disabled={isLoading}
              onClick={handleRequest}
            >
              request
            </WorkflowButton>
            {showRequest
              && (
                <Request
                  showRequest={showRequest}
                  setShowRequest={setShowRequest}
                />
              )}
          </>
        )}
        {!zkEvmProvider && (
          <WorkflowButton
            disabled={isLoading}
            onClick={connectZkEvm}
          >
            Connect ZkEvm
          </WorkflowButton>
        )}
      </Stack>
    </CardStack>
  );
}

export default ZkEvmWorkflow;
