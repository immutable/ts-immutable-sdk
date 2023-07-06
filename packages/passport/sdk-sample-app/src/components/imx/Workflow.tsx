import React, {
  useCallback,
  useState,
  useEffect,
} from 'react';
import { Card, Spinner, Stack } from 'react-bootstrap';
import { Button, Heading } from '@biom3/react';
import BulkTransfer from '@/components/imx/BulkTransfer';
import Order from '@/components/imx/Order';
import Transfer from '@/components/imx/Transfer';
import Trade from '@/components/imx/Trade';
import { useStatusProvider } from '@/context/StatusProvider';
import { usePassportProvider } from '@/context/PassportProvider';

function Workflow() {
  const [showBulkTransfer, setShowBulkTransfer] = useState<boolean>(false);
  const [showTrade, setShowTrade] = useState<boolean>(false);
  const [showTransfer, setShowTransfer] = useState<boolean>(false);
  const [showOrder, setShowOrder] = useState<boolean>(false);

  const { isLoading } = useStatusProvider();
  const {
    imxProvider, connectImx, connectImxSilent, logout,
  } = usePassportProvider();

  useEffect(() => {
    (async () => {
      if (!imxProvider) {
        connectImxSilent();
      }
    })();
  }, [imxProvider, connectImxSilent]);

  const handleBulkTransfer = () => {
    setShowBulkTransfer(true);
  };

  const handleTransfer = () => {
    setShowTransfer(true);
  };

  const handleTrade = () => {
    setShowTrade(true);
  };

  const handleOrder = useCallback(() => {
    setShowOrder(true);
  }, []);

  return (
    <Card>
      <Stack direction="horizontal" gap={3}>
        <Card.Title><Heading size="small">Workflow</Heading></Card.Title>
        <Card.Body>
          {!imxProvider
            && (
            <Button
              disabled={isLoading}
              variant={isLoading ? 'tertiary' : 'primary'}
              onClick={connectImx}
            >
              Login
            </Button>
            )}
          {imxProvider
            && (
            <Stack direction="horizontal" gap={3}>
              <Button onClick={logout}>Logout</Button>
              <Button onClick={handleTrade}>Buy</Button>
                {showTrade
                  && (
                  <Trade
                    showTrade={showTrade}
                    setShowTrade={setShowTrade}
                  />
                  )}
              <Button onClick={handleOrder}>Order</Button>
                {showOrder
                  && (
                  <Order
                    show={showOrder}
                    setShow={setShowOrder}
                  />
                  )}
              <Button onClick={handleTransfer}>Transfer</Button>
                {showTransfer
                  && (
                  <Transfer
                    showTransfer={showTransfer}
                    setShowTransfer={setShowTransfer}
                  />
                  )}
              <Button onClick={handleBulkTransfer}>Bulk Transfer</Button>
                {showBulkTransfer
                  && (
                  <BulkTransfer
                    showBulkTransfer={showBulkTransfer}
                    setShowBulkTransfer={setShowBulkTransfer}
                  />
                  )}
            </Stack>
            )}
        </Card.Body>
        {isLoading && <Spinner />}
      </Stack>
    </Card>
  );
}

export default Workflow;
