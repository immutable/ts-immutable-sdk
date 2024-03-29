import React from 'react';
import Head from 'next/head';
import { Container, Row } from 'react-bootstrap';
import Status from '@/components/Status';
import ImxWorkflow from '@/components/imx/ImxWorkflow';
import Message from '@/components/Message';
import Environment from '@/components/Environment';
import { usePassportProvider } from '@/context/PassportProvider';
import { useStatusProvider } from '@/context/StatusProvider';
import { BASE_PATH } from '@/config';
import PassportMethods from '@/components/PassportMethods';
import ZkEvmWorkflow from '@/components/zkevm/ZkEvmWorkflow';

export default function Home() {
  const { isLoading } = useStatusProvider();
  const { imxProvider, zkEvmProvider } = usePassportProvider();

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
            <Environment disabled={isLoading || !!imxProvider || !!zkEvmProvider} />
          </Row>
          <Row className="my-3">
            <PassportMethods />
          </Row>
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
