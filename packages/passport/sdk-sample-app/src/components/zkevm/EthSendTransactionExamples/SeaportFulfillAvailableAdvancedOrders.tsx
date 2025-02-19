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
import { ActionType, TransactionAction, TransactionPurpose } from '@imtbl/orderbook';
import { PreparedTransactionRequest } from 'ethers';

function SeaportFulfillAvailableAdvancedOrders({ disabled, handleExampleSubmitted }: RequestExampleProps) {
  const { orderbookClient } = useImmutableProvider();
  const { zkEvmProvider } = usePassportProvider();

  const [listingIds, setListingIds] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isBuldingTransaction, setIsBuildingTransaction] = useState<boolean>(false);
  const [transaction, setTransaction] = useState<PreparedTransactionRequest>();
  const [transactionError, setTransactionError] = useState<string>('');

  const seaportContractAddress = useMemo(
    () => (
      orderbookClient.config().seaportContractAddress
    ),
    [orderbookClient],
  );

  useEffect(() => {
    const getAddress = async () => {
      if (zkEvmProvider) {
        const [address] = await zkEvmProvider.request({
          method: 'eth_requestAccounts',
        });
        setWalletAddress(address || '');
      }
    };

    getAddress().catch(console.log);
  }, [zkEvmProvider, setWalletAddress]);

  useEffect(() => {
    setTransactionError('');
    setTransaction(undefined);
  }, [listingIds]);

  const validate = useCallback(async () => {
    setTransactionError('');
    setTransaction(undefined);
    setIsBuildingTransaction(true);

    try {
      const fulfillResponse = await orderbookClient.fulfillBulkOrders(
        listingIds.replace(' ', '').split(',').map((orderId) => ({
          listingId: orderId,
          takerFees: [],
        })),
        walletAddress,
      );

      if (!fulfillResponse.sufficientBalance) {
        setTransactionError('Insufficient balance to fulfill the order(s)');
        return;
      }

      const {
        actions, unfulfillableOrders,
      } = fulfillResponse;

      if (unfulfillableOrders.length > 0) {
        setTransactionError('Not all orders are fulfillable');
        return;
      }

      const verifyAction = actions.find((action) => (
        action.type === ActionType.TRANSACTION && action.purpose === TransactionPurpose.APPROVAL
      )) as TransactionAction | undefined;

      if (verifyAction) {
        const approvalTransaction = await verifyAction.buildTransaction();
        await zkEvmProvider?.request({
          method: 'eth_sendTransaction',
          params: [approvalTransaction],
        });
      }

      const transactionAction = actions.find((action) => (
        action.type === ActionType.TRANSACTION && action.purpose === TransactionPurpose.FULFILL_ORDER
      )) as TransactionAction | undefined;

      if (!transactionAction) {
        setTransactionError('Failed to find transaction to process');
        return;
      }

      setTransaction(await transactionAction.buildTransaction());
    } catch (err) {
      setTransactionError(`Failed to retrieve Seaport orders: ${err}`);
    } finally {
      setIsBuildingTransaction(false);
    }
  }, [listingIds, orderbookClient, walletAddress, zkEvmProvider]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    return handleExampleSubmitted({
      method: 'eth_sendTransaction',
      params: [transaction],
    });
  }, [handleExampleSubmitted, transaction]);

  return (
    <Accordion.Item eventKey="6">
      <Accordion.Header>Seaport Fulfill Available Advanced Orders</Accordion.Header>
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
              Listing IDs (comma separated)
            </Form.Label>
            <Form.Control
              required
              type="text"
              value={listingIds}
              isValid={transaction && !transactionError}
              isInvalid={!!transactionError || !listingIds}
              onChange={(e) => setListingIds(e.target.value)}
            />
            <Form.Control.Feedback type="invalid">
              {transactionError}
            </Form.Control.Feedback>
          </Form.Group>
          <Stack direction="horizontal" gap={3}>
            <WorkflowButton
              disabled={disabled || isBuldingTransaction || !!transaction}
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
            { isBuldingTransaction && <Spinner /> }
          </Stack>
        </Form>
      </Accordion.Body>
    </Accordion.Item>
  );
}

export default SeaportFulfillAvailableAdvancedOrders;
