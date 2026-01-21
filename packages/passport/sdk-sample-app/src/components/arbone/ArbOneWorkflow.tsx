import React, {
  ChangeEvent,
  useCallback,
  useState,
} from 'react';
import { Stack } from 'react-bootstrap';
import { usePassportProvider } from '@/context/PassportProvider';
import ArbOneRequest from '@/components/arbone/ArbOneRequest';
import CardStack from '@/components/CardStack';
import { useStatusProvider } from '@/context/StatusProvider';
import WorkflowButton from '@/components/WorkflowButton';
import { FormControl, Toggle } from '@biom3/react';
import { ProviderEvent } from '@imtbl/passport';

function ArbOneWorkflow() {
  const [showRequest, setShowRequest] = useState<boolean>(false);

  const { isLoading, addMessage } = useStatusProvider();
  const { connectArbOne, arbOneProvider } = usePassportProvider();

  const handleRequest = () => {
    setShowRequest(true);
  };

  const arbOneEventHandler = useCallback((eventName: string) => (args: any[]) => {
    addMessage(`Provider Event: ${eventName}`, args);
  }, [addMessage]);

  const onHandleEventsChanged = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      Object.values(ProviderEvent).forEach((eventName) => {
        arbOneProvider?.on(eventName, arbOneEventHandler(eventName));
      });
    } else {
      Object.values(ProviderEvent).forEach((eventName) => {
        arbOneProvider?.removeListener(eventName, arbOneEventHandler(eventName));
      });
    }
  }, [arbOneEventHandler, arbOneProvider]);

  return (
    <CardStack title="Arbitrum One Workflow">
      <Stack direction="horizontal" style={{ flexWrap: 'wrap' }} gap={3}>
        {arbOneProvider && (
          <>
            <WorkflowButton
              disabled={isLoading}
              onClick={handleRequest}
            >
              request
            </WorkflowButton>
            {showRequest
              && (
                <ArbOneRequest
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
        {!arbOneProvider && (
          <WorkflowButton
            disabled={isLoading}
            onClick={connectArbOne}
          >
            Connect Arbitrum Sepolia
          </WorkflowButton>
        )}
      </Stack>
    </CardStack>
  );
}

export default ArbOneWorkflow;
