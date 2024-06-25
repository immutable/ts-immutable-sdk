import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import {
  Accordion, Alert, Form, Stack,
} from 'react-bootstrap';
import WorkflowButton from '@/components/WorkflowButton';
import { RequestExampleProps } from '@/types';
import { useImmutableProvider } from '@/context/ImmutableProvider';
import { usePassportProvider } from '@/context/PassportProvider';
import { getCreateERC1155ListingPayload } from './SeaportCreateListingExample';

function SeaportCreateERC1155ListingDefault({ disabled, handleExampleSubmitted }: RequestExampleProps) {
  const { orderbookClient } = useImmutableProvider();
  const { zkEvmProvider } = usePassportProvider();

  const [params, setParams] = useState<any>();

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
        const chainIdHex = await zkEvmProvider.request({ method: 'eth_chainId' });
        const chainId = parseInt(chainIdHex, 16);
        const data = getCreateERC1155ListingPayload({ seaportContractAddress, walletAddress: address, chainId });
        setParams([address, data]);
      }
    };
    getAddress().catch(console.log);
  }, [zkEvmProvider, seaportContractAddress]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    return handleExampleSubmitted({
      method: 'eth_signTypedData_v4',
      params,
    });
  }, [handleExampleSubmitted, params]);

  return (
    <Accordion.Item eventKey="5">
      <Accordion.Header>Seaport Create Listing - ERC1155 order (Hardcoded example)</Accordion.Header>
      <Accordion.Body>
        <Alert variant="warning">
          Note: This method only returns a signed message, it does not submit an order to the orderbook.
        </Alert>
        <Form onSubmit={handleSubmit} className="mb-4">
          <Form.Group className="mb-3">
            <Form.Label>
              Preview
            </Form.Label>
            <Form.Control
              required
              disabled
              as="textarea"
              rows={7}
              value={JSON.stringify(params, null, '\t')}
            />
          </Form.Group>
          <Stack direction="horizontal" gap={3}>
            <WorkflowButton
              disabled={disabled}
              type="submit"
            >
              Submit
            </WorkflowButton>
          </Stack>
        </Form>
      </Accordion.Body>
    </Accordion.Item>
  );
}

export default SeaportCreateERC1155ListingDefault;
