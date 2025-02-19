import React, {
  useCallback, useEffect, useState,
} from 'react';
import { Accordion, Form } from 'react-bootstrap';
import InputGroup from 'react-bootstrap/InputGroup';
import { usePassportProvider } from '@/context/PassportProvider';
import WorkflowButton from '@/components/WorkflowButton';
import { RequestExampleProps } from '@/types';
import { useImmutableProvider } from '@/context/ImmutableProvider';
import { isAddress } from 'ethers';
import * as encUtils from 'enc-utils';

function ShowGenericConfirmationScreen({ disabled, handleExampleSubmitted }: RequestExampleProps) {
  const { orderbookClient } = useImmutableProvider();
  const defaultAddress = orderbookClient.config().seaportContractAddress;
  const [fromAddress, setFromAddress] = useState<string>('');
  const [toAddress, setToAddress] = useState<string>(defaultAddress);
  const [toAddressError, setToAddressError] = useState<string>('');
  const [data, setData] = useState<string>('1234567890');
  const { zkEvmProvider } = usePassportProvider();
  const [params, setParams] = useState<any[]>([]);
  const [dataError, setDataError] = useState<string>('');
  const emptyDataError = 'Data should not be empty and should be at least 10 characters';
  const invalidToAddressError = 'To address is not valid';
  const [toAddressTouched, setToAddressTouched] = useState(false);

  useEffect(() => {
    try {
      if (!data || data.length < 10) {
        setDataError(emptyDataError);
      } else {
        setDataError('');
      }
      setParams([{
        from: fromAddress,
        to: toAddress,
        data: data.startsWith('0x') ? data : encUtils.utf8ToHex(data, true),
      }]);
    } catch (err) {
      setDataError(emptyDataError);
      setParams([{
        from: fromAddress,
        to: toAddress,
        data: encUtils.utf8ToHex(data, true),
      }]);
    }
  }, [fromAddress, toAddress, data]);

  const handleToAddressChanged = ((newAddress: string) => {
    setToAddressTouched(true);
    if (isAddress(newAddress)) {
      setToAddressError('');
      setToAddress(newAddress);
    } else {
      setToAddressError(invalidToAddressError);
    }
  });

  useEffect(() => {
    const getAddress = async () => {
      if (zkEvmProvider) {
        const [walletAddress] = await zkEvmProvider.request({
          method: 'eth_requestAccounts',
        });
        setFromAddress(walletAddress || '');
      }
    };

    getAddress();
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
      <Accordion.Header>Default Transaction</Accordion.Header>
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
            <InputGroup hasValidation>
              <Form.Control
                required
                disabled={disabled}
                placeholder={toAddressTouched ? '' : defaultAddress}
                isValid={toAddressError === ''}
                isInvalid={toAddressError !== ''}
                onChange={(e) => handleToAddressChanged(e.target.value)}
              />
              <Form.Control.Feedback type="invalid" tooltip>
                {toAddressError}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>
              Data
            </Form.Label>
            <InputGroup hasValidation>
              <Form.Control
                required
                disabled={disabled}
                value={data}
                isValid={dataError === ''}
                isInvalid={dataError !== ''}
                onChange={(e) => setData(e.target.value)}
              />
              <Form.Control.Feedback type="invalid" tooltip>
                {dataError}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <WorkflowButton
            disabled={disabled || !!dataError || !!toAddressError}
            type="submit"
          >
            Submit
          </WorkflowButton>
        </Form>
      </Accordion.Body>
    </Accordion.Item>
  );
}

export default ShowGenericConfirmationScreen;
