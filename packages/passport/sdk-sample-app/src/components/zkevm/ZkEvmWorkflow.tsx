import React, {
  ChangeEvent,
  useCallback,
  useState,
} from 'react';
import { Stack } from 'react-bootstrap';
import { connectWallet, type ChainConfig, ZkEvmProvider } from '@imtbl/wallet';
import { useImmutableSession } from '@imtbl/auth-next-client';
import { usePassportProvider } from '@/context/PassportProvider';
import Request from '@/components/zkevm/Request';
import CardStack from '@/components/CardStack';
import { useStatusProvider } from '@/context/StatusProvider';
import WorkflowButton from '@/components/WorkflowButton';
import { FormControl, Toggle } from '@biom3/react';
import { ProviderEvent } from '@imtbl/passport';
import { useImmutableProvider } from '@/context/ImmutableProvider';
import { EnvironmentNames } from '@/types';
import { getAuthConfig } from '@/lib/immutable-auth';

// Chain configurations for each environment
// DEV environment requires explicit Magic keys since it's not a standard chain
const getChainConfig = (environment: EnvironmentNames): ChainConfig[] | undefined => {
  switch (environment) {
    case EnvironmentNames.DEV:
      return [{
        name: 'imtbl-zkevm-devnet',
        chainId: 15003,
        rpcUrl: 'https://rpc.dev.immutable.com',
        relayerUrl: 'https://api.dev.immutable.com/relayer-mr',
        apiUrl: 'https://api.dev.immutable.com',
        passportDomain: 'https://passport.dev.immutable.com',
        magicPublishableApiKey: 'pk_live_4058236363130CA9',
        magicProviderId: 'd196052b-8175-4a45-ba13-838a715d370f',
      }];
    case EnvironmentNames.SANDBOX:
      // Use testnet (default chain in wallet package)
      return undefined;
    case EnvironmentNames.PRODUCTION:
      // Use mainnet (default chain in wallet package)
      return undefined;
    default:
      return undefined;
  }
};

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
  // getUser from useImmutableSession is compatible with connectWallet's getUser option
  const { isAuthenticated: isNextAuthAuthenticated, getUser } = useImmutableSession();

  const handleRequest = () => {
    setShowRequest(true);
  };

  // Connect using wallet package with getUser from NextAuth (if authenticated) or default auth
  const handleConnectDefault = useCallback(async () => {
    setIsLoading(true);
    try {
      const authConfig = getAuthConfig(environment);
      const chains = getChainConfig(environment);

      // Use getUser from NextAuth if authenticated, otherwise use default auth
      const provider = await connectWallet({
        getUser: isNextAuthAuthenticated ? getUser : undefined,
        clientId: authConfig.clientId,
        chains,
      }) as ZkEvmProvider;

      if (provider) {
        // Request accounts to trigger login/registration flow
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setDefaultWalletProvider(provider);
          addMessage(
            'connectWallet',
            `Connected: ${accounts[0]} (${isNextAuthAuthenticated ? 'NextAuth' : 'default auth'})`,
          );
        } else {
          addMessage('connectWallet', 'No accounts returned');
        }
      } else {
        addMessage('connectWallet', 'No provider returned');
      }
    } catch (error) {
      addMessage('connectWallet', error);
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, environment, isNextAuthAuthenticated, getUser, setDefaultWalletProvider, setIsLoading]);

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
            {defaultWalletProvider && (
              <WorkflowButton
                variant="secondary"
                disabled={isLoading}
                onClick={handleClearDefault}
              >
                Clear Wallet
              </WorkflowButton>
            )}
          </>
        )}
        {!activeZkEvmProvider && (
          <>
            <WorkflowButton
              disabled={isLoading}
              onClick={handleConnectDefault}
            >
              Connect Wallet
            </WorkflowButton>
            <WorkflowButton
              disabled={isLoading}
              onClick={connectZkEvm}
            >
              Connect ZkEvm (Passport)
            </WorkflowButton>
          </>
        )}
      </Stack>
    </CardStack>
  );
}

export default ZkEvmWorkflow;
