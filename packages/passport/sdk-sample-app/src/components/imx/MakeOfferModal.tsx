import {
  Form,
  Image, Modal, Spinner, Stack,
} from 'react-bootstrap';
import { MakeOfferModalProps } from '@/types';
import React, { useState } from 'react';
import { utils } from 'ethers';
import WorkflowButton from '@/components/WorkflowButton';
import { usePassportProvider } from '@/context/PassportProvider';
import { UnsignedOrderRequest } from '@imtbl/core-sdk';
import { useStatusProvider } from '@/context/StatusProvider';

function MakeOfferModal({
  showModal, setShowModal, onClose, order,
}: MakeOfferModalProps) {
  const [offerAmount, setOfferAmount] = useState<string>('');
  const [expirationTimestamp, setExpirationTimestamp] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { imxProvider } = usePassportProvider();
  const { addMessage } = useStatusProvider();

  if (!order) {
    return <Spinner />;
  }

  const handleClose = () => {
    setShowModal(false);
    if (onClose) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const request: UnsignedOrderRequest = {
        sell: {
          type: 'ETH',
          amount: utils.parseEther(offerAmount).toString(),
        },
        buy: {
          type: 'ERC721',
          tokenId: order.sell.data.token_id || '',
          tokenAddress: order.sell.data.token_address || '',
        },
        expiration_timestamp: expirationTimestamp,
      };

      const createOrderResponse = await imxProvider?.createOrder(request);
      addMessage('Create Order', createOrderResponse);
    } catch (err) {
      addMessage('Create Order', err);
      handleClose();
    }
  };

  return (
    <Modal
      onHide={handleClose}
      show={showModal}
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Make an offer
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        { isLoading ? <Spinner /> : (
          <Stack gap={2}>
            <dl>
              <dt>Image</dt>
              <dd>
                <Image
                  src={order.sell.data.properties?.image_url || undefined}
                  alt={order.sell.data.properties?.name || ''}
                  width="150"
                  height="150"
                  thumbnail
                />
              </dd>
              <dt>Collection</dt>
              <dd>
                { order.sell.data.properties?.collection?.name || 'not found' }
              </dd>
              <dt>Name</dt>
              <dd>{ order.sell.data.properties?.name || 'not found' }</dd>
              <dt>Listing Price</dt>
              <dd>{ utils.formatEther(order.buy.data.quantity_with_fees).toString() }</dd>
            </dl>
            <Form.Group className="mb-3">
              <Form.Label>
                Offer Amount
              </Form.Label>
              <Form.Control
                required
                type="text"
                onChange={(e) => {
                  setOfferAmount(e.target.value);
                }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                Offer expiration
              </Form.Label>
              <Form.Control
                required
                type="date"
                onChange={(e) => {
                  setExpirationTimestamp(new Date(e.target.value).getTime());
                }}
              />
            </Form.Group>
          </Stack>
        )}
      </Modal.Body>
      <Modal.Footer>
        <WorkflowButton onClick={handleSubmit} disabled={isLoading}>
          Make Offer
        </WorkflowButton>
        <WorkflowButton disabled={isLoading} onClick={() => setShowModal(false)}>
          Cancel
        </WorkflowButton>
      </Modal.Footer>
    </Modal>
  );
}

export default MakeOfferModal;
