import React from 'react';
import {
  Col, Container, Row, Stack,
} from 'react-bootstrap';
import { usePassportProvider } from '@/context/PassportProvider';
import CardStack from '@/components/CardStack';

function Status() {
  const { imxProvider, zkEvmProvider } = usePassportProvider();

  return (
    <CardStack title="Status">
      <Container className="text-dark">
        <Row>
          <Col>
            {
                imxProvider
                  ? (
                    <Stack direction="horizontal" gap={1}>
                      <div className="led green-led" />
                      <span>Connected to IMX</span>
                    </Stack>
                  )
                  : (
                    <Stack direction="horizontal" gap={1}>
                      <div className="led red-led" />
                      <span>Disconnected from IMX</span>
                    </Stack>
                  )
              }
          </Col>
          <Col>
            {
                zkEvmProvider
                  ? (
                    <Stack direction="horizontal" gap={1}>
                      <div className="led green-led" />
                      <span>Connected to ZkEvm</span>
                    </Stack>
                  )
                  : (
                    <Stack direction="horizontal" gap={1}>
                      <div className="led red-led" />
                      <span>Disconnected from ZkEvm</span>
                    </Stack>
                  )
              }
          </Col>
        </Row>
      </Container>
    </CardStack>
  );
}

export default Status;
