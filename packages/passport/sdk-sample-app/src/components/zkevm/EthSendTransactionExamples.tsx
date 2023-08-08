import React, { useCallback, useEffect, useState } from 'react';
import { Accordion, Form } from 'react-bootstrap';
import { usePassportProvider } from '@/context/PassportProvider';
import WorkflowButton from '@/components/WorkflowButton';
import { RequestExampleProps } from '@/types';

function EthSendTransactionExamples({ disabled, handleExampleSubmitted }: RequestExampleProps) {
  const [activeAccordionKey, setActiveAccordionKey] = useState<string | string[] | undefined | null>('');
  const [fromAddress, setFromAddress] = useState<string>('');
  const [toAddress, setToAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const { zkEvmProvider } = usePassportProvider();

  const getParams = useCallback(() => ([{
    from: fromAddress,
    to: toAddress,
    value: amount,
  }]), [fromAddress, toAddress, amount]);

  useEffect(() => {
    const getAddress = async () => {
      if (zkEvmProvider) {
        const [walletAddress] = await zkEvmProvider.request({
          method: 'eth_requestAccounts',
        });
        setFromAddress(walletAddress || '');
      }
    };

    getAddress().catch(console.log);
  }, [zkEvmProvider, setFromAddress]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setActiveAccordionKey('');

    await handleExampleSubmitted({
      method: 'eth_sendTransaction',
      params: getParams(),
    });
  };

  const handleAccordionSelect = (eventKey: string | string[] | undefined | null) => {
    setActiveAccordionKey(eventKey);
  };

  return (
    <Accordion activeKey={activeAccordionKey} onSelect={handleAccordionSelect}>
      <Accordion.Item eventKey="0">
        <Accordion.Header>Transfer IMX</Accordion.Header>
        <Accordion.Body>
          <Form noValidate onSubmit={handleSubmit} className="mb-4">
            <Form.Group className="mb-3">
              <Form.Label>
                Preview
              </Form.Label>
              <Form.Control
                readOnly
                as="textarea"
                rows={7}
                value={JSON.stringify(getParams(), null, '\t')}
                style={{
                  fontSize: '0.8rem',
                }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                From
              </Form.Label>
              <Form.Control
                required
                disabled
                type="text"
                placeholder="From Address"
                value={fromAddress}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                To
              </Form.Label>
              <Form.Control
                required
                type="text"
                onChange={(e) => setToAddress(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                Amount
              </Form.Label>
              <Form.Control
                required
                type="text"
                onChange={(e) => setAmount(e.target.value)}
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
    </Accordion>
  );
}

export default EthSendTransactionExamples;
