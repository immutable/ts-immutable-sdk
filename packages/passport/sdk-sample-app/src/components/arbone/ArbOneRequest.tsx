import React, { useState } from 'react';
import {
  Form, Offcanvas, Spinner, Stack,
} from 'react-bootstrap';
import { Heading } from '@biom3/react';
import { ModalProps } from '@/types';
import { useStatusProvider } from '@/context/StatusProvider';
import { usePassportProvider } from '@/context/PassportProvider';
import { RequestArguments } from '@imtbl/passport';
import WorkflowButton from '@/components/WorkflowButton';

enum EthereumParamType {
  string = 'string',
  object = 'object',
}

interface EthereumParam {
  name: string;
  type?: EthereumParamType;
  default?: string;
  placeholder?: string;
}

interface EthereumMethod {
  name: string;
  params?: Array<EthereumParam>;
}

// Simplified Ethereum methods for ArbOne - only the essential ones
const ArbOneEthereumMethods: EthereumMethod[] = [
  { name: 'eth_requestAccounts' },
  {
    name: 'eth_getBalance',
    params: [
      { name: 'address' },
      { name: 'blockNumber/tag', default: 'latest' },
    ],
  },
  {
    name: 'eth_sendTransaction',
    params: [
      {
        name: 'transaction',
        type: EthereumParamType.object,
        placeholder: '{ "to": "0x...", "value": "0x0", "data": "0x" }',
      },
    ],
  },
];

function ArbOneRequest({ showModal, setShowModal }: ModalProps) {
  const [selectedEthMethod, setSelectedEthMethod] = useState<EthereumMethod>(ArbOneEthereumMethods[0]);
  const [params, setParams] = useState<string[]>([]);
  const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
  const [isInvalid, setInvalid] = useState<boolean | undefined>(undefined);

  const { addMessage } = useStatusProvider();
  const { arbOneProvider } = usePassportProvider();

  const resetForm = () => {
    setParams([]);
    setInvalid(false);
  };

  const handleClose = () => {
    resetForm();
    setShowModal(false);
  };

  const performRequest = async (request: RequestArguments) => {
    setInvalid(false);
    setLoadingRequest(true);
    try {
      const result = await arbOneProvider?.request(request);
      setLoadingRequest(false);
      addMessage(request.method, result);
      handleClose();
    } catch (err) {
      addMessage('Request', err);
      handleClose();
    }
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
            case EthereumParamType.object: {
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
    const ethMethod = ArbOneEthereumMethods.find((method) => method.name === e.target.value);
    if (!ethMethod) {
      console.error('Invalid eth method');
    } else {
      setSelectedEthMethod(ethMethod);
      setParams(ethMethod.params ? ethMethod.params.map((param) => param.default || '') : []);
    }
  };

  return (
    <Offcanvas
      show={showModal}
      onHide={handleClose}
      backdrop="static"
      placement="end"
      style={{ width: '35%' }}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title><Heading>ArbOne Request</Heading></Offcanvas.Title>
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
                ArbOneEthereumMethods.map((method) => (
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
                    placeholder={param.placeholder}
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
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default ArbOneRequest;

