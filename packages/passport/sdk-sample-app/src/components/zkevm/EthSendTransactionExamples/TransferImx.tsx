import React, { useCallback, useEffect, useState } from 'react';
import { Accordion, Form } from 'react-bootstrap';
import InputGroup from 'react-bootstrap/InputGroup';
import { usePassportProvider } from '@/context/PassportProvider';
import WorkflowButton from '@/components/WorkflowButton';
import { RequestExampleProps } from '@/types';
import { parseUnits } from 'ethers';

function TransferImx({ disabled, handleExampleSubmitted }: RequestExampleProps) {
  const [fromAddress, setFromAddress] = useState<string>('');
  const [toAddress, setToAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('0');
  const { zkEvmProvider } = usePassportProvider();
  const [params, setParams] = useState<any[]>([]);
  const [amountConvertError, setAmountConvertError] = useState<string>('');
  const imxTokenDecimal = 18;
  const amountRange = 'Amount should larger than 0 with maximum 18 digits in decimal';

  useEffect(() => {
    setAmountConvertError('');
    const rawAmount = amount.trim() === '' ? '0' : amount;
    try {
      if (Number(rawAmount) < 0) {
        setAmountConvertError(amountRange);
      }
      const value = parseUnits(rawAmount, imxTokenDecimal).toString();
      setParams([{
        from: fromAddress,
        to: toAddress,
        value,
      }]);
    } catch (err) {
      setAmountConvertError(amountRange);
      setParams([{
        from: fromAddress,
        to: toAddress,
        value: '0',
      }]);
    }
  }, [fromAddress, toAddress, amount]);

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

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    await handleExampleSubmitted({
      method: 'eth_sendTransaction',
      params,
    });
  }, [params, handleExampleSubmitted]);

  return (
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
              value={JSON.stringify(params, null, '\t')}
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
              disabled={disabled}
              type="text"
              onChange={(e) => setToAddress(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>
              Amount
            </Form.Label>
            <InputGroup hasValidation>
              <Form.Control
                required
                disabled={disabled}
                type="number"
                value={amount}
                isValid={amountConvertError === ''}
                isInvalid={amountConvertError !== ''}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Form.Control.Feedback type="invalid" tooltip>
                {amountConvertError}
              </Form.Control.Feedback>
            </InputGroup>
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

export default TransferImx;
