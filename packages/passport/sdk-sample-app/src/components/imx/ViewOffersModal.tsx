import { utils } from 'ethers';
import {
  Alert,
  Button, Modal, Spinner, Table,
} from 'react-bootstrap';
import React, { useCallback, useEffect, useState } from 'react';
import { OrderV3 } from '@imtbl/core-sdk';
import WorkflowButton from '@/components/WorkflowButton';
import { usePassportProvider } from '@/context/PassportProvider';
import { useStatusProvider } from '@/context/StatusProvider';
import { useImmutableProvider } from '@/context/ImmutableProvider';
import { ViewOffersModalProps } from '@/types';

function ViewOffersModal({
  showModal, setShowModal, buyTokenAddress, buyTokenId, onClose,
}: ViewOffersModalProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [offers, setOffers] = useState<Array<OrderV3>>([]);

  const { coreSdkClient } = useImmutableProvider();
  const { imxProvider } = usePassportProvider();
  const { addMessage } = useStatusProvider();

  const handleClose = useCallback(() => {
    setShowModal(false);
    if (onClose) {
      onClose();
    }
  }, [onClose, setShowModal]);

  useEffect(() => {
    if (!buyTokenAddress || !buyTokenId) {
      return;
    }

    const onMount = async () => {
      try {
        setIsLoading(true);
        const result = await coreSdkClient.listOrders({
          buyTokenAddress,
          buyTokenId,
          orderBy: 'sell_quantity',
          direction: 'desc',
          status: 'active',
          sellTokenAddress: undefined,
          sellTokenType: 'ETH',
        });
        setOffers(result.result);
      } catch (err) {
        addMessage('View Offers', err);
        handleClose();
      }
    };

    onMount()
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [addMessage, buyTokenAddress, buyTokenId, coreSdkClient, handleClose]);

  const acceptOffer = async (orderId: number) => {
    setIsLoading(true);

    try {
      const user = await imxProvider?.getAddress() || '';
      const createTradeResponse = await imxProvider?.createTrade({
        order_id: orderId,
        user,
        fees: [{
          address: '0x8e70719571e87a328696ad099a7d9f6adc120892',
          fee_percentage: 1,
        }],
      });
      addMessage('CreateTrade', createTradeResponse);
    } catch (err) {
      addMessage('CreateTrade', err);
      handleClose();
    }
  };

  return (
    <Modal
      onHide={() => setShowModal(false)}
      show={showModal}
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Offers received
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        { isLoading && <Spinner /> }
        { !isLoading && (offers.length ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Offer symbol</th>
                <th>Offer amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {
            offers.map((offer) => (
              <tr key={offer.order_id}>
                <td>{ offer.sell.data.symbol || 'ETH' }</td>
                <td>{ utils.formatUnits(offer.sell.data.quantity, offer.sell.data.decimals) }</td>
                <td>
                  <Button
                    size="sm"
                    variant="dark"
                    onClick={() => acceptOffer(offer.order_id)}
                  >
                    Accept Offer
                  </Button>
                </td>
              </tr>
            ))
          }
            </tbody>
          </Table>
        ) : <Alert>This asset has no active offers.</Alert>) }
      </Modal.Body>
      <Modal.Footer>
        <WorkflowButton disabled={isLoading} onClick={() => setShowModal(false)}>
          Cancel
        </WorkflowButton>
      </Modal.Footer>
    </Modal>
  );
}

export default ViewOffersModal;
