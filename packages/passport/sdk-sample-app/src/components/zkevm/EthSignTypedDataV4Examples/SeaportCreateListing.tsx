import { utils } from 'ethers';
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import {
  Accordion, Alert, Form, Spinner, Stack,
} from 'react-bootstrap';
import WorkflowButton from '@/components/WorkflowButton';
import { RequestExampleProps } from '@/types';
import { useImmutableProvider } from '@/context/ImmutableProvider';
import { usePassportProvider } from '@/context/PassportProvider';
import {
  ActionType, SignableAction, SignablePurpose,
} from '@imtbl/orderbook';

type TokenType = 'NATIVE' | 'ERC20';

const { _TypedDataEncoder: typedDataEncoder } = utils;

function SeaportCreateListing({ disabled, handleExampleSubmitted }: RequestExampleProps) {
  const { orderbookClient } = useImmutableProvider();
  const { zkEvmProvider } = usePassportProvider();

  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isBuldingTransaction, setIsBuildingTransaction] = useState<boolean>(false);
  const [transaction, setTransaction] = useState<any>();
  const [transactionError, setSignMessageError] = useState<string>('');

  const [NFTContractAddress, setNFTContractAddress] = useState<string>('');
  const [tokenContractAddress, setTokenContractAddress] = useState<string>('');
  const [buyAmount, setBuyAmount] = useState<string>('');
  const [buyType, setBuyType] = useState<'NATIVE' | 'ERC20'>('NATIVE');
  const [tokenId, setTokenId] = useState<string>('');

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
    setSignMessageError('');
    setTransaction(undefined);
  }, [NFTContractAddress, tokenContractAddress, buyAmount, buyType, tokenId]);

  const validate = useCallback(async () => {
    const buy = buyType === 'NATIVE'
      ? { amount: buyAmount, type: buyType }
      : { amount: buyAmount, type: buyType, contractAddress: tokenContractAddress };
    try {
      setIsBuildingTransaction(true);
      const { actions } = await orderbookClient.prepareListing({
        makerAddress: walletAddress,
        buy,
        sell: {
          contractAddress: NFTContractAddress,
          tokenId,
          type: 'ERC721',
        },
      });

      const signAction = actions.find((action) => (
        action.type === ActionType.SIGNABLE && action.purpose === SignablePurpose.CREATE_LISTING
      )) as SignableAction | undefined;

      const populated = await typedDataEncoder.resolveNames(
        signAction!.message!.domain,
        signAction!.message!.types,
        signAction!.message!.value,
        (name: string) => Promise.resolve(name),
      );

      const payload = typedDataEncoder.getPayload(populated.domain, signAction!.message!.types, populated.value);
      setTransaction(payload);
    } catch (err) {
      setSignMessageError(`Failed to validate listing: ${err}`);
    } finally {
      setIsBuildingTransaction(false);
    }
  }, [NFTContractAddress, buyAmount, buyType, orderbookClient, tokenContractAddress, tokenId, walletAddress]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    return handleExampleSubmitted({
      method: 'eth_signTypedData_v4',
      params: [walletAddress, transaction],
    });
  }, [handleExampleSubmitted, transaction, walletAddress]);

  return (
    <Accordion.Item eventKey="5">
      <Accordion.Header>Seaport Create Listing</Accordion.Header>
      <Accordion.Body>
        <Alert variant="warning">
          Note: This method only returns a signed message, it does not submit an order to the orderbook.
        </Alert>
        {transactionError
        && (
        <Alert variant="danger" style={{ wordBreak: 'break-word' }}>
          {transactionError}
        </Alert>
        )}
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
              NFT Contract Address
            </Form.Label>
            <Form.Control
              required
              type="text"
              value={NFTContractAddress}
              isValid={transaction && !transactionError}
              isInvalid={!!transactionError}
              onChange={(e) => setNFTContractAddress(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>
              Token ID
            </Form.Label>
            <Form.Control
              required
              type="number"
              value={tokenId}
              isValid={transaction && !transactionError}
              isInvalid={!!transactionError}
              onChange={(e) => setTokenId(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>
              Currency Type
            </Form.Label>
            <Form.Select
              required
              value={buyType}
              onChange={(e) => setBuyType(e.target.value as TokenType)}
            >
              <option value="NATIVE">Native</option>
              <option value="ERC20">ERC20</option>
            </Form.Select>
          </Form.Group>
          {buyType === 'ERC20' && (
          <Form.Group className="mb-3">
            <Form.Label>
              Currency Contract Address
            </Form.Label>
            <Form.Control
              required
              value={tokenContractAddress}
              isValid={transaction && !transactionError}
              isInvalid={!!transactionError}
              onChange={(e) => setTokenContractAddress(e.target.value)}
            />
          </Form.Group>
          )}
          <Form.Group className="mb-3">
            <Form.Label>
              Currency Amount
            </Form.Label>
            <Form.Control
              required
              type="text"
              value={buyAmount}
              isValid={transaction && !transactionError}
              isInvalid={!!transactionError}
              onChange={(e) => setBuyAmount(e.target.value)}
            />
          </Form.Group>
          <Stack direction="horizontal" gap={3}>
            <WorkflowButton
              disabled={disabled || isBuldingTransaction || !!transaction || !!transactionError}
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

export default SeaportCreateListing;
