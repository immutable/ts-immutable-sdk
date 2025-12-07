import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import {
  Accordion, Form, Spinner, Stack,
} from 'react-bootstrap';
import WorkflowButton from '@/components/WorkflowButton';
import { RequestExampleProps } from '@/types';
import { useImmutableProvider } from '@/context/ImmutableProvider';
import { usePassportProvider } from '@/context/PassportProvider';
import { PreparedTransactionRequest } from 'ethers';

function SeaportCancel({ disabled, handleExampleSubmitted }: RequestExampleProps) {
  const { orderbookClient } = useImmutableProvider();
  const { activeZkEvmProvider, activeZkEvmAccount } = usePassportProvider();

  const [orderIds, setOrderIds] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isBuildingTransaction, setIsBuildingTransaction] = useState<boolean>(false);
  const [transaction, setTransaction] = useState<PreparedTransactionRequest>();
  const [transactionError, setTransactionError] = useState<string>('');

  const seaportContractAddress = useMemo(
    () => (
      orderbookClient.config().seaportContractAddress
    ),
    [orderbookClient],
  );

  useEffect(() => {
    setWalletAddress(activeZkEvmAccount || '');
  }, [activeZkEvmAccount]);

  useEffect(() => {
    setTransactionError('');
    setTransaction(undefined);
  }, [orderIds]);

  const validate = useCallback(async () => {
    setTransactionError('');
    setTransaction(undefined);
    setIsBuildingTransaction(true);

    try {
      const { cancellationAction } = await orderbookClient.cancelOrdersOnChain(
        orderIds.replaceAll(' ', '').split(','),
        walletAddress,
      );

      setTransaction(await cancellationAction.buildTransaction());
    } catch (err) {
      setTransactionError(`Failed to build Seaport cancellation transaction: ${err}`);
    } finally {
      setIsBuildingTransaction(false);
    }
  }, [orderIds, orderbookClient, walletAddress]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    return handleExampleSubmitted({
      method: 'eth_sendTransaction',
      params: [transaction],
    });
  }, [handleExampleSubmitted, transaction]);

  return (
    <Accordion.Item eventKey="7">
      <Accordion.Header>Seaport Cancel</Accordion.Header>
      <Accordion.Body>
        <Form onSubmit={handleSubmit} className="mb-4">
          <Form.Group className="mb-3">
            <Form.Label>
              Seaport Contract Address
            </Form.Label>
            <Form.Control
              required
              disabled
              type="text"
              value={seaportContractAddress}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>
              Order IDs (comma separated)
            </Form.Label>
            <Form.Control
              required
              type="text"
              value={orderIds}
              isValid={transaction && !transactionError}
              isInvalid={!!transactionError || !orderIds}
              onChange={(e) => setOrderIds(e.target.value)}
            />
            <Form.Control.Feedback type="invalid">
              {transactionError}
            </Form.Control.Feedback>
          </Form.Group>
          <Stack direction="horizontal" gap={3}>
            <WorkflowButton
              disabled={disabled || isBuildingTransaction || !!transaction}
              type="button"
              onClick={validate}
            >
              Validate
            </WorkflowButton>
            <WorkflowButton
              disabled={disabled || !transaction}
              type="submit"
            >
              Submit
            </WorkflowButton>
            { isBuildingTransaction && <Spinner /> }
          </Stack>
        </Form>
      </Accordion.Body>
    </Accordion.Item>
  );
}

export default SeaportCancel;
