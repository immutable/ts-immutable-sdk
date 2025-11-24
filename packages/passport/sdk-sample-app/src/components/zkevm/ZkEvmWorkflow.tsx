import React, {
  ChangeEvent,
  useCallback,
  useState,
} from 'react';
import { Stack } from 'react-bootstrap';
import { usePassportProvider } from '@/context/PassportProvider';
import Request from '@/components/zkevm/Request';
import CardStack from '@/components/CardStack';
import { useStatusProvider } from '@/context/StatusProvider';
import WorkflowButton from '@/components/WorkflowButton';
import { FormControl, Toggle } from '@biom3/react';
import { ProviderEvent } from '@imtbl/passport';

function ZkEvmWorkflow() {
  const [showRequest, setShowRequest] = useState<boolean>(false);

  const { isLoading, addMessage } = useStatusProvider();
  const { connectZkEvm, zkEvmProvider } = usePassportProvider();

  const handleRequest = () => {
    setShowRequest(true);
  };

  const zkEvmEventHandler = useCallback((eventName: string) => (args: any[]) => {
    addMessage(`Provider Event: ${eventName}`, args);
  }, [addMessage]);

  const onHandleEventsChanged = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      Object.values(ProviderEvent).forEach((eventName) => {
        zkEvmProvider?.on?.(eventName, zkEvmEventHandler(eventName));
      });
    } else {
      Object.values(ProviderEvent).forEach((eventName) => {
        zkEvmProvider?.removeListener?.(eventName, zkEvmEventHandler(eventName));
      });
    }
  }, [zkEvmEventHandler, zkEvmProvider]);

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
                  showModal={showRequest}
                  setShowModal={setShowRequest}
                />
              )}
            <FormControl sx={{ alignItems: 'center' }}>
              <Toggle onChange={onHandleEventsChanged} />
              <FormControl.Label>Log out events</FormControl.Label>
            </FormControl>
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
