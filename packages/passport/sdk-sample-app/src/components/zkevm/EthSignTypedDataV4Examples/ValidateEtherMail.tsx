import React, { useCallback, useEffect, useState } from 'react';
import {
  Accordion, Alert, Form, Spinner, Stack,
} from 'react-bootstrap';
import InputGroup from 'react-bootstrap/InputGroup';
import { usePassportProvider } from '@/context/PassportProvider';
import WorkflowButton from '@/components/WorkflowButton';
import { RequestExampleProps } from '@/types';
import { TypedDataPayload } from '@imtbl/passport';
import { getEtherMailTypedPayload } from './etherMailTypedPayload';
import { isValidTypedDataSignature } from './isValidTypedDataSignature';

function ValidateEtherMail({ disabled }: RequestExampleProps) {
  const [address, setAddress] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  const [isValidSignature, setIsValidSignature] = useState<boolean | undefined>();
  const [signatureValidationMessage, setSignatureValidationMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [etherMailTypedPayload, setEtherMailTypedPayload] = useState<TypedDataPayload | undefined>();

  const { zkEvmProvider } = usePassportProvider();

  useEffect(() => {
    const populateParams = async () => {
      if (zkEvmProvider) {
        const chainIdHex = await zkEvmProvider.request({ method: 'eth_chainId' });
        const chainId = parseInt(chainIdHex, 16).toString();
        setEtherMailTypedPayload(getEtherMailTypedPayload(chainId, address));
      }
    };

    populateParams().catch(console.log);
  }, [zkEvmProvider, address]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setIsValidSignature(undefined);
    setSignatureValidationMessage('');
    setIsLoading(true);

    try {
      if (!zkEvmProvider) {
        setIsValidSignature(false);
        setSignatureValidationMessage('zkEvmProvider cannot be null');
        return;
      }

      if (!etherMailTypedPayload) {
        setIsValidSignature(false);
        setSignatureValidationMessage('Example typedDataPayload cannot be null');
        return;
      }

      const isValid = await isValidTypedDataSignature(
        address,
        JSON.stringify(etherMailTypedPayload),
        signature,
        zkEvmProvider,
      );

      setIsValidSignature(isValid);
      setSignatureValidationMessage(isValid ? 'Signature is valid' : 'Signature is invalid');
    } catch (ex) {
      setIsValidSignature(false);
      setSignatureValidationMessage(`Failed to validate signature: ${ex}`);
    } finally {
      setIsLoading(false);
    }
  }, [address, etherMailTypedPayload, signature, zkEvmProvider]);

  return (
    <Accordion.Item eventKey="2">
      <Accordion.Header>Validate Ether Mail Signature</Accordion.Header>
      <Accordion.Body>
        <Alert variant="warning">
          Note: This functionality is not provided by the Immutable SDK.
        </Alert>
        <Form noValidate onSubmit={handleSubmit} className="mb-4">
          <Form.Group className="mb-3">
            <Form.Label>
              Address
            </Form.Label>
            <Form.Control
              required
              disabled={disabled || isLoading}
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>
              Payload
            </Form.Label>
            <Form.Control
              required
              value={etherMailTypedPayload ? JSON.stringify(etherMailTypedPayload) : ''}
              disabled
              type="text"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>
              Signature
            </Form.Label>
            <InputGroup>
              <Form.Control
                required
                disabled={disabled || isLoading}
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
              />
            </InputGroup>
          </Form.Group>
          <Stack direction="horizontal" gap={3}>
            <WorkflowButton
              disabled={disabled || isLoading}
              type="submit"
            >
              Validate
            </WorkflowButton>
            { isLoading && <Spinner /> }
            {
              isValidSignature !== undefined
              && (
              <p>
                { isValidSignature ? '✅' : '❌' }
                {' '}
                { signatureValidationMessage }
              </p>
              )
            }
          </Stack>
        </Form>
      </Accordion.Body>
    </Accordion.Item>
  );
}

export default ValidateEtherMail;
