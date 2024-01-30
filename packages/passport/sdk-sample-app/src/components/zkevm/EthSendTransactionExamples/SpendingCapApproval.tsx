import React, { useCallback, useEffect, useState } from 'react';
import { Accordion, Form } from 'react-bootstrap';
import InputGroup from 'react-bootstrap/InputGroup';
import { usePassportProvider } from '@/context/PassportProvider';
import WorkflowButton from '@/components/WorkflowButton';
import { RequestExampleProps } from '@/types';
import { Interface } from 'ethers/lib/utils';

function SpendingCapApproval({ disabled, handleExampleSubmitted }: RequestExampleProps) {
  const abi = [
    "function approve(address spender, uint256 amount)"
  ];
  const iface = new Interface(abi);
  const [fromAddress, setFromAddress] = useState<string>('');
  const [erc20ContractAddress, setErc20ContractAddress] = useState<string>('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
  const [spender, setSpender] = useState<string>("0xf419b5a6a3dfbf3d3a6beefff331be38ee464080");
  const [amount, setAmount] = useState<string>('1');
  const [amountConvertError, setAmountConvertError] = useState<string>('');
  const [params, setParams] = useState<any[]>([]);
  const amountRange = 'Amount should larger than 0';

  const { zkEvmProvider } = usePassportProvider();

  useEffect(() => {
    setAmountConvertError('');
    const allowAmount = amount.trim() === '' ? '0' : amount;
    try {
      if (Number(allowAmount) < 0) {
        setAmountConvertError(amountRange);
      }
      const data = iface.encodeFunctionData("approve", [spender, allowAmount]);
      setParams([{
        from: fromAddress,
        to: erc20ContractAddress,
        value: '0',
        data
      }]);
    } catch (err) {
      setParams([{
        from: fromAddress,
        to: erc20ContractAddress,
        value: '0',
        data: '0x'
      }]);
    }
  }, [fromAddress, erc20ContractAddress, spender, amount]);

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
    <Accordion.Item eventKey="1">
      <Accordion.Header>Spending Cap Approval</Accordion.Header>
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
              ERC20
            </Form.Label>
            <Form.Control
              required
              disabled={disabled}
              type="text"
              value={erc20ContractAddress}
              onChange={(e) => setErc20ContractAddress(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>
              Spender
            </Form.Label>
            <Form.Control
              required
              disabled={disabled}
              type="text"
              onChange={(e) => setSpender(e.target.value)}
              value={spender}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>
              Allow Amount
            </Form.Label>
            <Form.Control
              required
              type="number"
              disabled={disabled}
              isValid={amountConvertError === ''}
              isInvalid={amountConvertError !== ''}
              onChange={(e) => setAmount(e.target.value)}
              value={amount}
            />
            <Form.Control.Feedback type="invalid" tooltip>
                {amountConvertError}
            </Form.Control.Feedback>
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

export default SpendingCapApproval;
