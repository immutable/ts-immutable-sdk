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

interface EthereumMethod {
  name: string;
}

const EthereumMethods: EthereumMethod[] = [
  { name: 'eth_requestAccounts' },
  { name: 'eth_accounts' },
  { name: 'eth_chainId' },
];

function Request({ showModal, setShowModal }: ModalProps) {
  const [selectedEthMethod, setSelectedEthMethod] = useState<EthereumMethod>(EthereumMethods[0]);
  const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
  const [isInvalid, setInvalid] = useState<boolean | undefined>(undefined);

  const { addMessage } = useStatusProvider();
  const { arbitrumProvider } = usePassportProvider();

  const resetForm = () => {
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
      if (!arbitrumProvider) {
        addMessage('Request', 'No Arbitrum provider connected. Connect via "Connect Arbitrum" first.');
        setLoadingRequest(false);
        setInvalid(true);
        return;
      }
      const result = await arbitrumProvider.request(request);
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
        <Offcanvas.Title><Heading>Arbitrum Request</Heading></Offcanvas.Title>
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

export default Request;
