import React, {
  ChangeEvent,
  useCallback,
  useState,
} from 'react';
import { Stack, Form } from 'react-bootstrap';
import { usePassportProvider } from '@/context/PassportProvider';
import Request from '@/components/zkevm/Request';
import CardStack from '@/components/CardStack';
import { useStatusProvider } from '@/context/StatusProvider';
import WorkflowButton from '@/components/WorkflowButton';
import { FormControl, Toggle } from '@biom3/react';
import { ProviderEvent } from '@imtbl/passport';
import { providers } from 'ethers';

function ZkEvmWorkflow() {
  const [showRequest, setShowRequest] = useState<boolean>(false);

  const { isLoading, addMessage } = useStatusProvider();
  const { connectZkEvm, zkEvmProvider } = usePassportProvider();

  const [payload, setPayload] = useState<string>('');
  const handleSignTypedData = async () => {
    try {
      if (zkEvmProvider) {
        const web3Provider = new providers.Web3Provider(zkEvmProvider);
        const signer = web3Provider.getSigner();
        const message = JSON.parse(payload);
        const signature = await signer._signTypedData(message.domain, message.types, message.value)
        addMessage('Signature', signature);
      }
    } catch (error) {
      addMessage('Failed to sign typed data', error);
    }
  };

  const handleRequest = () => {
    setShowRequest(true);

  };

  const zkEvmEventHandler = useCallback((eventName: string) => (args: any[]) => {
    addMessage(`Provider Event: ${eventName}`, args);
  }, [addMessage]);

  const onHandleEventsChanged = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      Object.values(ProviderEvent).forEach((eventName) => {
        zkEvmProvider?.on(eventName, zkEvmEventHandler(eventName));
      });
    } else {
      Object.values(ProviderEvent).forEach((eventName) => {
        zkEvmProvider?.removeListener(eventName, zkEvmEventHandler(eventName));
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
            <WorkflowButton
              disabled={isLoading}
              onClick={handleSignTypedData}
            >
              eth_signTypedData_v4
            </WorkflowButton>
            <Form.Group>
              <Form.Label>
                Sign Typed Data Payload
              </Form.Label>
              <Form.Control
                required
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                type="text"
              />
            </Form.Group>
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
