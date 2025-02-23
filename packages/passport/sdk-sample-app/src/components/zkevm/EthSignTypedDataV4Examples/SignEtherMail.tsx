import React, { useCallback, useEffect, useState } from 'react';
import { Accordion, Form } from 'react-bootstrap';
import { usePassportProvider } from '@/context/PassportProvider';
import WorkflowButton from '@/components/WorkflowButton';
import { RequestExampleProps } from '@/types';
import { getEtherMailTypedPayload } from './etherMailTypedPayload';

function SignEtherMail({ disabled, handleExampleSubmitted }: RequestExampleProps) {
  const [address, setAddress] = useState<string>('');
  const [params, setParams] = useState<any[]>([]);

  const { zkEvmProvider } = usePassportProvider();

  useEffect(() => {
    const populateParams = async () => {
      if (zkEvmProvider) {
        const chainIdHex = await zkEvmProvider.request({ method: 'eth_chainId' });
        const chainId = parseInt(chainIdHex, 16).toString();
        const etherMailTypedPayload = getEtherMailTypedPayload(chainId, address);

        setParams([
          address,
          etherMailTypedPayload,
        ]);
      }
    };

    populateParams().catch(console.log);
  }, [address, zkEvmProvider]);

  useEffect(() => {
    const getAddress = async () => {
      if (zkEvmProvider) {
        const [walletAddress] = await zkEvmProvider.request({
          method: 'eth_requestAccounts',
        });
        setAddress(walletAddress || '');
      }
    };

    getAddress().catch(console.log);
  }, [zkEvmProvider, setAddress]);

  const handleSubmitSignPayload = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    await handleExampleSubmitted({
      method: 'eth_signTypedData_v4',
      params,
    });
  }, [params, handleExampleSubmitted]);

  return (
    <Accordion.Item eventKey="1">
      <Accordion.Header>Sign Ether Mail Payload</Accordion.Header>
      <Accordion.Body>
        <Form noValidate onSubmit={handleSubmitSignPayload} className="mb-4">
          <Form.Group className="mb-3">
            <Form.Label>
              Preview
            </Form.Label>
            <Form.Control
              readOnly
              as="textarea"
              rows={7}
              value={JSON.stringify(params, null, '\t').replaceAll('\\n', '')}
              style={{
                fontSize: '0.8rem',
              }}
            />
          </Form.Group>
          <WorkflowButton
            disabled={disabled}
            type="submit"
          >
            Submit
          </WorkflowButton>
        </Form>
      </Accordion.Body>
    </Accordion.Item>
  );
}

export default SignEtherMail;
