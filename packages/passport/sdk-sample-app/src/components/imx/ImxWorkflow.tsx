import React, {
  useCallback,
  useState,
} from 'react';
import { Stack } from 'react-bootstrap';
import BulkTransfer from '@/components/imx/BulkTransfer';
import Order from '@/components/imx/Order';
import Transfer from '@/components/imx/Transfer';
import Trade from '@/components/imx/Trade';
import { usePassportProvider } from '@/context/PassportProvider';
import CardStack from '@/components/CardStack';
import { useStatusProvider } from '@/context/StatusProvider';
import WorkflowButton from '@/components/WorkflowButton';

function ImxWorkflow() {
  const [showBulkTransfer, setShowBulkTransfer] = useState<boolean>(false);
  const [showTrade, setShowTrade] = useState<boolean>(false);
  const [showTransfer, setShowTransfer] = useState<boolean>(false);
  const [showOrder, setShowOrder] = useState<boolean>(false);

  const { addMessage, isLoading } = useStatusProvider();
  const { connectImx, imxProvider } = usePassportProvider();

  const getAddress = useCallback(async () => {
    const address = await imxProvider?.getAddress();
    addMessage('Get Address', address);
  }, [addMessage, imxProvider]);

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
    <CardStack title="Imx Workflow">
      <Stack direction="horizontal" style={{ flexWrap: 'wrap' }} gap={3}>
        {!imxProvider && (
          <>
            <WorkflowButton
              disabled={isLoading}
              onClick={connectImx}
            >
              Connect
            </WorkflowButton>
          </>
        )}
        {imxProvider && (
          <>
            <WorkflowButton
              disabled={isLoading}
              onClick={handleTrade}
            >
              Buy
            </WorkflowButton>
            {showTrade
              && (
                <Trade
                  showModal={showTrade}
                  setShowModal={setShowTrade}
                />
              )}
            <WorkflowButton
              disabled={isLoading}
              onClick={handleOrder}
            >
              Order
            </WorkflowButton>
            {showOrder
              && (
                <Order
                  showModal={showOrder}
                  setShowModal={setShowOrder}
                />
              )}
            <WorkflowButton
              disabled={isLoading}
              onClick={handleTransfer}
            >
              Transfer
            </WorkflowButton>
            {showTransfer
              && (
                <Transfer
                  showModal={showTransfer}
                  setShowModal={setShowTransfer}
                />
              )}
            <WorkflowButton
              disabled={isLoading}
              onClick={handleBulkTransfer}
            >
              Bulk Transfer
            </WorkflowButton>
            {showBulkTransfer
              && (
                <BulkTransfer
                  showModal={showBulkTransfer}
                  setShowModal={setShowBulkTransfer}
                />
              )}
            <WorkflowButton
              disabled={isLoading}
              onClick={getAddress}
            >
              Get Address
            </WorkflowButton>
          </>
        )}
      </Stack>
    </CardStack>
  );
}

export default ImxWorkflow;
