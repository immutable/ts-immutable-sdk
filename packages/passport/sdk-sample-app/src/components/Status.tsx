import React from 'react';
import {
  Card, Col, Row, Stack,
} from 'react-bootstrap';
import { Heading } from '@biom3/react';
import OAuthDetail from '@/components/OAuthDetail';
import WalletDetail from '@/components/WalletDetail';
import { usePassportProvider } from '@/context/PassportProvider';

function Status() {
  const { userInfo, imxProvider } = usePassportProvider();

  const authentication = userInfo ? {
    cssStyle: 'led green-led',
    authenticated: 'Authenticated',
  } : {
    cssStyle: 'led red-led',
    authenticated: 'Not authenticated',
  };

  const walletConnection = imxProvider ? {
    cssStyle: 'led green-led',
    connection: 'Connected to IMX',
  } : {
    cssStyle: 'led red-led',
    connection: 'Disconnected from IMX',
  };

  return (
    <>
      <Card>
        <Stack direction="horizontal" gap={3}>
          <Card.Title><Heading size="small">Status</Heading></Card.Title>
          <Card.Body className="text-dark">
            <Row>
              <Col>
                <Stack direction="horizontal" gap={1}>
                  <div className={authentication.cssStyle} />
                  <span>{authentication.authenticated}</span>
                </Stack>
              </Col>
              <Col>
                <Stack direction="horizontal" gap={1}>
                  <div className={walletConnection.cssStyle} />
                  <span>{walletConnection.connection}</span>
                </Stack>
              </Col>
            </Row>
          </Card.Body>
        </Stack>
      </Card>
      {userInfo && <OAuthDetail /> }
      {imxProvider && <WalletDetail />}
    </>
  );
}

export default Status;
