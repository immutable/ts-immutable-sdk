import React, {
  ChangeEventHandler,
  MouseEventHandler,
  useEffect,
  useState,
} from 'react';
import {
  Alert, Button, Card, Form, Image, Offcanvas, Spinner, Stack, Table,
} from 'react-bootstrap';
import { Heading } from '@biom3/react';
import { Asset, NftTransferDetails } from '@imtbl/core-sdk';
import { BulkTransferProps } from '@/types';
import { useImmutableProvider } from '@/context/ImmutableProvider';
import { usePassportProvider } from '@/context/PassportProvider';
import { useStatusProvider } from '@/context/StatusProvider';

interface Transfer {
  key: string;
  receiver: string;
  tokenId: string;
  tokenAddress: string;
}

function BulkTransfer({ showBulkTransfer, setShowBulkTransfer }: BulkTransferProps) {
  const [isInvalid, setInvalid] = useState<boolean | undefined>(undefined);
  const [loadingTransfer, setLoadingTransfer] = useState<boolean>(false);
  const [loadingAssets, setLoadingAssets] = useState<boolean>(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transfers, setTransfers] = useState<Partial<Transfer>[]>([{}]);

  const { addMessage } = useStatusProvider();
  const { imxProvider } = usePassportProvider();
  const { coreSdkClient } = useImmutableProvider();

  useEffect(() => {
    setLoadingAssets(true);
    const getAssets = async () => {
      const imxWalletAddress = await imxProvider?.getAddress();
      const result = await coreSdkClient.listAssets({ user: imxWalletAddress });
      setAssets(result.result);
      setLoadingAssets(false);
    };
    getAssets().catch(console.log);
  }, [coreSdkClient, imxProvider]);

  useEffect(() => {
    (async () => {
      setLoadingAssets(true);
      if (showBulkTransfer) {
        setAssets([]);

        const imxWalletAddress = await imxProvider?.getAddress();
        const result = await coreSdkClient.listAssets({ user: imxWalletAddress });
        setAssets(result.result);
        setLoadingAssets(false);
      }
    })();
  }, [showBulkTransfer, coreSdkClient, imxProvider]);

  const resetForm = () => {
    setTransfers([]);
    setInvalid(false);
  };

  const handleClose = () => {
    resetForm();
    setLoadingTransfer(false);
    setShowBulkTransfer(false);
  };

  const addTransfer = () => {
    setTransfers([
      ...transfers,
      {
        key: Date.now().toString(),
      },
    ]);
  };

  const removeTransfer = (index: number): MouseEventHandler => () => {
    if (transfers.length <= 1) {
      addTransfer();
    } else {
      const array = transfers.slice();
      array.splice(index, 1);
      setTransfers(array);
    }
  };

  const updateTransfer = (
    index: number,
    property: keyof NftTransferDetails,
  ): ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> => (event) => {
    const array = [...transfers];
    array[index] = {
      ...array[index],
    };
    array[index][property] = event.target.value;
    setTransfers(array);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const form = e.currentTarget;
    if (form.checkValidity()) {
      setInvalid(false);
      setLoadingTransfer(true);
      try {
        const transferResponse = await imxProvider?.batchNftTransfer(transfers as NftTransferDetails[]);
        if (transferResponse) {
          setLoadingTransfer(false);
          addMessage('Bulk Transfer', `Transferred ${transfers.length} tokens`);
          handleClose();
        }
      } catch (err) {
        addMessage('Bulk Transfer', err);
        handleClose();
      }
    } else {
      setInvalid(true);
    }
  };

  return (
    <Offcanvas
      show={showBulkTransfer}
      onHide={handleClose}
      backdrop="static"
      placement="end"
      style={{ width: '35%' }}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title><Heading>Bulk Transfer</Heading></Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Form noValidate validated={isInvalid} onSubmit={handleSubmit} className="mb-4">
          <Stack gap={3}>
            {transfers.map((transfer, index) => (
              <Card key={transfer.key}>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Receiver
                      <span style={{ color: 'red' }}> *</span>
                    </Form.Label>
                    <Form.Control
                      required
                      disabled={loadingTransfer}
                      type="text"
                      placeholder="Add receiver's wallet address"
                      onChange={updateTransfer(index, 'receiver')}
                    />
                    <Form.Control.Feedback type="invalid">
                      Receiver is required
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Token Address
                      <span style={{ color: 'red' }}> *</span>
                    </Form.Label>
                    <Form.Control
                      required
                      disabled={loadingTransfer}
                      type="text"
                      placeholder="e.g. 0xacb3c6a43d15b907e8433077b6d38ae40936fe2c"
                      onChange={updateTransfer(index, 'tokenAddress')}
                    />
                    <Form.Control.Feedback type="invalid">
                      Token Address is required
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Token ID
                      <span style={{ color: 'red' }}> *</span>
                    </Form.Label>
                    <Form.Control
                      required
                      disabled={loadingTransfer}
                      type="text"
                      placeholder="e.g. 1234"
                      onChange={updateTransfer(index, 'tokenId')}
                    />
                    <Form.Control.Feedback type="invalid">
                      Token ID is required
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Button
                    variant="dark"
                    color="danger"
                    type="submit"
                    onClick={removeTransfer(index)}
                    disabled={loadingTransfer}
                  >
                    Delete
                  </Button>
                </Card.Body>
              </Card>
            ))}
            <Stack direction="horizontal" gap={3}>
              <Button variant="dark" type="submit" onClick={addTransfer} disabled={loadingTransfer}>
                Add Transfer
              </Button>
              <Button variant="dark" type="submit" disabled={loadingTransfer}>
                Submit
              </Button>
              { loadingTransfer && <Spinner /> }
            </Stack>
          </Stack>
        </Form>

        {(!loadingAssets && assets.length > 0)
          && (
          <>
            <hr />
            <Heading size="small">Your Assets</Heading>
            <Table striped bordered hover responsive className="mt-2">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Image</th>
                  <th>Token Address</th>
                  <th>Token ID</th>
                </tr>
              </thead>
              <tbody>
                {
                assets.map((asset, index) => (
                  <tr key={asset.token_id}>
                    <td>{index}</td>
                    <td>{asset.name}</td>
                    <td>
                      <Image
                        src={asset.image_url || undefined}
                        alt={asset.name || ''}
                        width="150"
                        height="150"
                        thumbnail
                      />
                    </td>
                    <td style={{ wordBreak: 'break-all' }}>{asset.token_address}</td>
                    <td style={{ wordBreak: 'break-all' }}>{asset.token_id}</td>
                  </tr>
                ))
}
              </tbody>
            </Table>
          </>
          )}
        {(!loadingAssets && assets.length === 0)
          && <Alert variant="info">You have no assets available to transfer</Alert>}
        {loadingAssets
            && <Spinner />}
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default BulkTransfer;
