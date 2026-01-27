import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Stack } from 'react-bootstrap';
import { connectWallet, ZkEvmProvider } from '@imtbl/wallet';
import { usePassportProvider } from '@/context/PassportProvider';
import Request from '@/components/zkevm/Request';
import CardStack from '@/components/CardStack';
import { useStatusProvider } from '@/context/StatusProvider';
import WorkflowButton from '@/components/WorkflowButton';
import { FormControl, Toggle } from '@biom3/react';
import { ProviderEvent } from '@imtbl/passport';
import { useImmutableProvider } from '@/context/ImmutableProvider';
import { EnvironmentNames } from '@/types';

function ZkEvmWorkflow() {
  const [showRequest, setShowRequest] = useState<boolean>(false);

  const { isLoading, addMessage, setIsLoading } = useStatusProvider();
  const {
    connectZkEvm,
    defaultWalletProvider,
    activeZkEvmProvider,
    setDefaultWalletProvider,
  } = usePassportProvider();
  const { environment } = useImmutableProvider();
  const isSandboxEnvironment = environment === EnvironmentNames.SANDBOX;
  const [isClientReady, setIsClientReady] = useState(false);
  const canUseDefaultConnect = isClientReady && isSandboxEnvironment;

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  const handleRequest = () => {
    setShowRequest(true);
  };

  const handleConnectDefault = useCallback(async () => {
    if (!canUseDefaultConnect) {
      addMessage('connectWallet (default auth)', 'Default auth connect is only available in Sandbox.');
      return;
    }
    setIsLoading(true);
    try {
      const provider = await connectWallet() as ZkEvmProvider;
      if (provider) {
        setDefaultWalletProvider(provider);
        addMessage(
          'connectWallet (default auth)',
          'Connected using built-in Immutable configuration',
        );
      } else {
        addMessage('connectWallet (default auth)', 'No provider returned');
      }
    } catch (error) {
      addMessage('connectWallet (default auth)', error);
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, canUseDefaultConnect, setDefaultWalletProvider, setIsLoading]);

  const handleClearDefault = useCallback(() => {
    setDefaultWalletProvider(undefined);
    addMessage('connectWallet (default auth)', 'Provider cleared');
  }, [addMessage, setDefaultWalletProvider]);

  const zkEvmEventHandler = useCallback((eventName: string) => (args: any[]) => {
    addMessage(`Provider Event: ${eventName}`, args);
  }, [addMessage]);

  const onHandleEventsChanged = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      Object.values(ProviderEvent).forEach((eventName) => {
        activeZkEvmProvider?.on?.(eventName, zkEvmEventHandler(eventName));
      });
    } else {
      Object.values(ProviderEvent).forEach((eventName) => {
        activeZkEvmProvider?.removeListener?.(eventName, zkEvmEventHandler(eventName));
      });
    }
  }, [activeZkEvmProvider, zkEvmEventHandler]);

  return (
    <CardStack title="ZkEvm Workflow">
      <Stack direction="horizontal" style={{ flexWrap: 'wrap' }} gap={3}>
        {activeZkEvmProvider && (
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
            {defaultWalletProvider && canUseDefaultConnect && (
              <WorkflowButton
                variant="secondary"
                disabled={isLoading}
                onClick={handleClearDefault}
              >
                Clear Default Wallet
              </WorkflowButton>
            )}
          </>
        )}
        {!activeZkEvmProvider && (
          <>
            {canUseDefaultConnect && (
              <WorkflowButton
                disabled={isLoading}
                onClick={handleConnectDefault}
              >
                Connect with Defaults
              </WorkflowButton>
            )}
            <WorkflowButton
              disabled={isLoading}
              onClick={connectZkEvm}
            >
              Connect ZkEvm
            </WorkflowButton>
            {!isSandboxEnvironment && (
              <p className="text-muted mb-0">
                Default auth connect is only available in the Sandbox environment.
              </p>
            )}
          </>
        )}
      </Stack>
    </CardStack>
  );
}

export default ZkEvmWorkflow;
