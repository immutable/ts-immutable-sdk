import React, { useState } from 'react';
import {
  Form, Offcanvas, Spinner, Stack,
} from 'react-bootstrap';
import { Divider, Heading } from '@biom3/react';
import { RequestExampleProps, RequestProps } from '@/types';
import { useStatusProvider } from '@/context/StatusProvider';
import { usePassportProvider } from '@/context/PassportProvider';
import { RequestArguments } from '@imtbl/passport';
import WorkflowButton from '@/components/WorkflowButton';
import EthSendTransactionExamples from './EthSendTransactionExamples';

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
  exampleComponent?: React.ComponentType<RequestExampleProps>;
}

const EthereumMethods: EthereumMethod[] = [
  { name: 'eth_requestAccounts' },
  { name: 'eth_accounts' },
  {
    name: 'eth_sendTransaction',
    params: [
      { name: 'transaction', type: EthereumParamType.object },
    ],
    exampleComponent: EthSendTransactionExamples,
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

  const performRequest = async (request: RequestArguments) => {
    setInvalid(false);
    setLoadingRequest(true);
    try {
      const result = await zkEvmProvider?.request(request);
      setLoadingRequest(false);
      addMessage(selectedEthMethod?.name, result);
      handleClose();
    } catch (err) {
      addMessage('Request', err);
      handleClose();
    }
  };

  const handleExampleSubmitted = async (request: RequestArguments) => {
    if (request.params) {
      const newParams = params;
      request.params.forEach((param, i) => {
        newParams[i] = JSON.stringify(param);
      });
      setParams(newParams);
    }
    await performRequest(request);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const form = e.currentTarget;
    if (form.checkValidity()) {
      await performRequest({
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
            <Form.Select
              disabled={loadingRequest}
              onChange={handleSetEthMethod}
            >
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
                    disabled={loadingRequest}
                    key={param.name}
                    type="text"
                    value={params[index]}
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
          <Stack direction="horizontal" gap={3}>
            <WorkflowButton
              disabled={loadingRequest}
              type="submit"
            >
              Submit
            </WorkflowButton>
            { loadingRequest && <Spinner /> }
          </Stack>
        </Form>
        { selectedEthMethod?.exampleComponent && (
          <Stack gap={3} style={{ marginTop: '24px' }}>
            <Divider />
            <Heading
              as="h2"
              size="medium"
            >
              Example transactions
            </Heading>
            { React.createElement(selectedEthMethod.exampleComponent, {
              handleExampleSubmitted,
              disabled: loadingRequest,
            }) }
          </Stack>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default Request;
