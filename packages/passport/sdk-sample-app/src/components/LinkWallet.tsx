import React, { useState } from 'react';
import {
  Button, Form, Offcanvas, Spinner, Stack,
} from 'react-bootstrap';
import { ModalProps } from '@/types';
import { Heading } from '@biom3/react';
import { generateNonce } from 'siwe';

function LinkWallet({ showModal, setShowModal, onSubmit }: ModalProps & {
  onSubmit: (type: string, walletAddress: string, signature: string, nonce: string) => void;
}) {
  const [type, setType] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isInvalid, setInvalid] = useState<boolean | undefined>(undefined);

  const resetForm = () => {
    setType('');
    setWalletAddress('');
    setSignature('');
  };

  const handleClose = () => {
    resetForm();
    setInvalid(false);
    setIsSubmitting(false);
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const form = e.currentTarget;
    if (form.checkValidity()) {
      setInvalid(false);
      setIsSubmitting(true);
      try {
        const nonce = generateNonce();
        await onSubmit(type, walletAddress, signature, nonce);
      } catch (err) {
        console.error('Error linking wallet:', err);
      } finally {
        handleClose();
      }
    } else {
      setInvalid(true);
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
        <Offcanvas.Title><Heading>Link Wallet</Heading></Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Form noValidate validated={isInvalid} onSubmit={handleSubmit} className="mb-4">
          <Form.Group className="mb-3">
            <Form.Label>
              Type
              <span style={{ color: 'red' }}> *</span>
            </Form.Label>
            <Form.Control
              required
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
            />
            <Form.Control.Feedback type="invalid">
              Type is required
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>
              Wallet Address
              <span style={{ color: 'red' }}> *</span>
            </Form.Label>
            <Form.Control
              required
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
            />
            <Form.Control.Feedback type="invalid">
              Wallet Address is required
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>
              Signature
              <span style={{ color: 'red' }}> *</span>
            </Form.Label>
            <Form.Control
              required
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
            />
            <Form.Control.Feedback type="invalid">
              Signature is required
            </Form.Control.Feedback>
          </Form.Group>
          <Stack direction="horizontal" gap={3}>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            {!isSubmitting && (
              <Button variant="primary" type="submit">
                Link Wallet
              </Button>
            )}
            {isSubmitting && <Spinner animation="border" />}
          </Stack>
        </Form>
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default LinkWallet;
