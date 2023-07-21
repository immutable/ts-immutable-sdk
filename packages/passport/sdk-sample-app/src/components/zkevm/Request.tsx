import React, { useState } from 'react';
import {
  Button, Form, Offcanvas, Spinner, Stack,
} from 'react-bootstrap';
import { Heading } from '@biom3/react';
import { RequestProps } from '@/types';
import { useStatusProvider } from '@/context/StatusProvider';
import { usePassportProvider } from '@/context/PassportProvider';

enum EthereumParamType {
  string = 'string',
  flag = 'flag',
  object = 'object',
}

interface EthereumParam {
  name: string;
  type?: EthereumParamType;
  default?: string;
}

interface EthereumMethod {
  name: string;
  params?: Array<EthereumParam>;
}

const EthereumMethods: EthereumMethod[] = [
  { name: 'eth_requestAccounts' },
  { name: 'eth_accounts' },
  {
    name: 'eth_sendTransaction',
    params: [
      { name: 'transaction', type: EthereumParamType.object },
    ],
  },
  { name: 'eth_gasPrice' },
  {
    name: 'eth_getBalance',
    params: [
      { name: 'address' },
      { name: 'blockNumber/tag', default: 'latest' },
    ],
  },
  {
    name: 'eth_getStorageAt',
    params: [
      { name: 'address' },
      { name: 'position' },
      { name: 'blockNumber', default: 'latest' },
    ],
  },
  {
    name: 'eth_estimateGas',
    params: [
      { name: 'transaction', type: EthereumParamType.object },
    ],
  },
  {
    name: 'eth_call',
    params: [
      { name: 'transaction' },
      { name: 'blockNumber/tag', default: 'latest' },
    ],
  },
  { name: 'eth_blockNumber' },
  { name: 'eth_chainId' },
  {
    name: 'eth_getBlockByHash',
    params: [
      { name: 'hash' },
      { name: 'transaction_detail_flag', type: EthereumParamType.flag },
    ],
  },
  {
    name: 'eth_getBlockByNumber',
    params: [
      { name: 'blockNumber/tag' },
      { name: 'transaction_detail_flag', type: EthereumParamType.flag },
    ],
  },
  {
    name: 'eth_getTransactionByHash',
    params: [
      { name: 'hash' },
    ],
  },
  {
    name: 'eth_getTransactionReceipt',
    params: [
      { name: 'hash' },
    ],
  },
  {
    name: 'eth_getTransactionCount',
    params: [
      { name: 'address' },
    ],
  },
];

function Request({ showRequest, setShowRequest }: RequestProps) {
  const [selectedEthMethod, setSelectedEthMethod] = useState<EthereumMethod>(EthereumMethods[0]);
  const [params, setParams] = useState<string[]>([]);
  const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
  const [isInvalid, setInvalid] = useState<boolean | undefined>(undefined);

  const { addMessage } = useStatusProvider();
  const { zkEvmProvider } = usePassportProvider();

  const resetForm = () => {
    setParams([]);
    setInvalid(false);
  };

  const handleClose = () => {
    resetForm();
    setShowRequest(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const form = e.currentTarget;
    if (form.checkValidity()) {
      setInvalid(false);
      setLoadingRequest(true);
      try {
        const result = await zkEvmProvider?.request({
          method: selectedEthMethod?.name || '',
          params: params.map((param, i) => {
            switch (selectedEthMethod.params![i].type) {
              case EthereumParamType.flag: {
                return param === 'true';
              }
              case EthereumParamType.object: {
                console.log(param);
                return JSON.parse(param);
              }
              default: {
                return param;
              }
            }
          }),
        });
        setLoadingRequest(false);
        addMessage(selectedEthMethod?.name, result);
        handleClose();
      } catch (err) {
        addMessage('Request', err);
        handleClose();
      }
    } else {
      setInvalid(true);
    }
  };

  const handleSetEthMethod = (e: React.ChangeEvent<HTMLSelectElement>) => {
    resetForm();
    const ethMethod = EthereumMethods.find((method) => method.name === e.target.value);
    if (!ethMethod) {
      console.error('Invalid eth method');
    } else {
      setSelectedEthMethod(ethMethod);
      setParams(ethMethod.params ? ethMethod.params.map((param) => param.default || '') : []);
    }
  };

  return (
    <Offcanvas
      show={showRequest}
      onHide={handleClose}
      backdrop="static"
      placement="end"
      style={{ width: '35%' }}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title><Heading>Request</Heading></Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Form noValidate validated={isInvalid} onSubmit={handleSubmit} className="mb-4">
          <Form.Group className="mb-3">
            <Form.Label>Ethereum Method</Form.Label>
            <Form.Select onChange={handleSetEthMethod}>
              {
                EthereumMethods.map((method) => (
                  <option key={method.name} value={method.name}>{method.name}</option>
                ))
              }
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            {
              selectedEthMethod?.params?.map((param, index) => (
                <div key={param.name}>
                  <Form.Label>{param.name}</Form.Label>
                  <Form.Control
                    key={param.name}
                    type="text"
                    value={param.default}
                    onChange={(e) => {
                      const newParams = [...params];
                      newParams[index] = e.target.value;
                      setParams(newParams);
                    }}
                  />
                </div>
              ))
            }
          </Form.Group>
          { !loadingRequest
              && (
              <Button variant="dark" type="submit">
                Submit
              </Button>
              )}
          { loadingRequest
              && (
              <Stack direction="horizontal" gap={3}>
                <Button disabled variant="dark" type="submit" style={{ opacity: '0.5' }}>
                  Submit
                </Button>
                <Spinner />
              </Stack>
              )}
        </Form>
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default Request;
