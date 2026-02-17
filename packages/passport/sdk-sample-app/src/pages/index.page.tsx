import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Container, Row } from 'react-bootstrap';
import { useImmutableSession } from '@imtbl/auth-next-client';
import Status from '@/components/Status';
import ImxWorkflow from '@/components/imx/ImxWorkflow';
import Message from '@/components/Message';
import Environment from '@/components/Environment';
import { usePassportProvider } from '@/context/PassportProvider';
import { useStatusProvider } from '@/context/StatusProvider';
import { useImmutableProvider } from '@/context/ImmutableProvider';
import { BASE_PATH } from '@/config';
import PassportMethods from '@/components/PassportMethods';
import ZkEvmWorkflow from '@/components/zkevm/ZkEvmWorkflow';
import AuthNextJS from '@/components/AuthNextJS';
import { EnvironmentNames } from '@/types';

/**
 * Login flow visibility rules:
 * - DEFAULT env: only Auth NextJS (SSR) makes sense; Passport Methods hidden
 * - Logged in via SSR: Passport Methods hidden (mutually exclusive)
 * - Logged in via Passport (imx/zkEvm): Auth NextJS hidden (mutually exclusive)
 *
 * Conditional rendering is deferred until after mount to avoid hydration mismatch:
 * environment (localStorage), session, and providers differ between server and client.
 */
export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  const { isLoading } = useStatusProvider();
  const { environment } = useImmutableProvider();
  const {
    imxProvider, zkEvmProvider, defaultWalletProvider,
  } = usePassportProvider();
  const { isAuthenticated: isAuthNextJSAuthenticated } = useImmutableSession();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const isDefaultEnv = environment === EnvironmentNames.DEFAULT;
  const isPassportConnected = !!imxProvider || !!zkEvmProvider;

  // Before mount: show both for consistent server/client HTML (avoids hydration mismatch)
  const showAuthNextJS = !hasMounted || isDefaultEnv || !isPassportConnected;
  const showPassportMethods = !hasMounted || (!isDefaultEnv && !isAuthNextJSAuthenticated);

  return (
    <>
      <Head>
        <title>Passport Sample Application</title>
        <meta name="description" content="Passport sample application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={`${BASE_PATH}/images/favicon.ico`} />
      </Head>
      <main>
        <Container>
          <Row className="my-3">
            <Environment
              disabled={isLoading || !!imxProvider || !!zkEvmProvider
                || !!defaultWalletProvider || isAuthNextJSAuthenticated}
            />
          </Row>
          {showAuthNextJS && (
            <Row className="my-3">
              <AuthNextJS />
            </Row>
          )}
          {showPassportMethods && (
            <Row className="my-3">
              <PassportMethods />
            </Row>
          )}
          <Row className="my-3">
            <ImxWorkflow />
          </Row>
          <Row className="my-3">
            <ZkEvmWorkflow />
          </Row>
          <Row className="mb-3">
            <Message />
          </Row>
          <Row className="mb-3">
            <Status />
          </Row>
        </Container>
      </main>
    </>
  );
}
