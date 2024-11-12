import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Accordion, Form } from 'react-bootstrap';
import InputGroup from 'react-bootstrap/InputGroup';
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

function TransferERC20({ disabled, handleExampleSubmitted }: RequestExampleProps) {
  const { environment } = useImmutableProvider();
  const [fromAddress, setFromAddress] = useState<string>('');
  const [toAddress, setToAddress] = useState<string>('');
  const [useTransferFrom, setUseTransferFrom] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('0');
  const [contractAddress, setContractAddress] = useState<string>(getErc20DefaultContractAddress(environment));
  const { zkEvmProvider } = usePassportProvider();
  const [params, setParams] = useState<any[]>([]);
  const [amountConvertError, setAmountConvertError] = useState<string>('');
  const amountRange = 'Amount should larger than 0 with maximum 18 digits in decimal';

  const erc20Transfer = useMemo(() => {
    const abi = [
      'function transfer(address to, uint256 amount)',
      'function transferFrom(address from, address to, uint256 amount)',
    ];
    return new Interface(abi);
  }, []);

  useEffect(() => {
    setAmountConvertError('');
    const rawAmount = amount.trim() === '' ? '0' : amount;

    if (!fromAddress || !toAddress || !contractAddress) {
      return;
    }

    try {
      if (Number(rawAmount) < 0) {
        setAmountConvertError(amountRange);
      }

      let data = erc20Transfer.encodeFunctionData('transfer', [toAddress, amount]);
      if (useTransferFrom) {
        data = erc20Transfer.encodeFunctionData('transferFrom', [fromAddress, toAddress, amount]);
      }

      setParams([{
        from: fromAddress,
        to: contractAddress,
        value: '0',
        data,
      }]);
    } catch (err) {
      setParams([{
        from: fromAddress,
        to: contractAddress,
        value: '0',
        data: '0x',
      }]);
    }
  }, [fromAddress, toAddress, contractAddress, amount, erc20Transfer, useTransferFrom]);

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
    <Accordion.Item eventKey="3">
      <Accordion.Header>Transfer ERC20</Accordion.Header>
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
              disabled={!useTransferFrom || disabled}
              type="text"
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              onClick={() => {
                setUseTransferFrom(!useTransferFrom);
              }}
              type="checkbox"
              label="Use transferFrom method"
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
              Contract Address
            </Form.Label>
            <Form.Control
              required
              disabled={disabled}
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
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

export default TransferERC20;
