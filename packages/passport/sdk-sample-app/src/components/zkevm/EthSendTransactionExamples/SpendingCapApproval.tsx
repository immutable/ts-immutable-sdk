import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { Accordion, Form } from 'react-bootstrap';
import { usePassportProvider } from '@/context/PassportProvider';
import WorkflowButton from '@/components/WorkflowButton';
import { RequestExampleProps, EnvironmentNames } from '@/types';
import { useImmutableProvider } from '@/context/ImmutableProvider';
import { Interface } from 'ethers';

const getErc20DefaultContractAddress = (environment: EnvironmentNames) => {
  switch (environment) {
    case EnvironmentNames.SANDBOX:
      return '0x7bbe61ba86dc1b128b7c6228a4834bf2c1394240';
    case EnvironmentNames.PRODUCTION:
      return '0x52a6c53869ce09a731cd772f245b97a4401d3348';
    case EnvironmentNames.DEV:
      return '0xba919c45c487c6a7d4e7bc5b42d4ff143a80f041';
    default:
      return '';
  }
};

function SpendingCapApproval({ disabled, handleExampleSubmitted }: RequestExampleProps) {
  const { environment } = useImmutableProvider();
  const iface = useMemo(() => {
    const abi = [
      'function approve(address spender, uint256 amount)',
    ];
    return new Interface(abi);
  }, []);
  const [fromAddress, setFromAddress] = useState<string>('');
  const [erc20ContractAddress, setErc20ContractAddress] = useState<string>(getErc20DefaultContractAddress(environment));
  const [spender, setSpender] = useState<string>();
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
      const data = iface.encodeFunctionData('approve', [spender, allowAmount]);
      setParams([{
        from: fromAddress,
        to: erc20ContractAddress,
        value: '0',
        data,
      }]);
    } catch (err) {
      setParams([{
        from: fromAddress,
        to: erc20ContractAddress,
        value: '0',
        data: '0x',
      }]);
    }
  }, [fromAddress, erc20ContractAddress, spender, amount, iface]);

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
    <Accordion.Item eventKey="2">
      <Accordion.Header>Spending Cap Approval</Accordion.Header>
      <Accordion.Body>
        <Form onSubmit={handleSubmit} className="mb-4">
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
              placeholder="Spender's Address"
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
