import { utils } from 'ethers';
import React, { useEffect, useState } from 'react';
import {
  Alert, Button, Image, Offcanvas, Spinner, Stack, Table,
} from 'react-bootstrap';
import { Heading } from '@biom3/react';
import { GetSignableTradeRequest, Order } from '@imtbl/core-sdk';
import { ModalProps } from '@/types';
import { usePassportProvider } from '@/context/PassportProvider';
import { useImmutableProvider } from '@/context/ImmutableProvider';
import { useStatusProvider } from '@/context/StatusProvider';
import EthBalance from '@/components/imx/EthBalance';
import MakeOfferModal from '@/components/imx/MakeOfferModal';

function Trade({ showModal: showTradeModal, setShowModal: setShowTradeModal }: ModalProps) {
  const [tradeIndex, setTradeIndex] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);
  const [loadingTrade, setLoadingTrade] = useState<boolean>(false);
  const [showMakeOffer, setShowMakeOffer] = useState<boolean>(false);

  const { addMessage } = useStatusProvider();
  const { coreSdkClient } = useImmutableProvider();
  const { imxProvider } = usePassportProvider();

  useEffect(() => {
    (async () => {
      if (coreSdkClient && showTradeModal) {
        setLoadingOrders(true);
        setOrders([]);

        const result = await coreSdkClient.listOrders({
          status: 'active',
          orderBy: 'updated_at',
          direction: 'asc',
          sellTokenType: 'ERC721',
        });
        setOrders(result.result);
        setLoadingOrders(false);
      }
    })();
  }, [showTradeModal, coreSdkClient]);

  const handleCloseTrade = () => {
    setLoadingTrade(false);
    setShowTradeModal(false);
  };

  const createTrade = async (id: number, index: number) => {
    setLoadingTrade(true);
    setTradeIndex(index);
    try {
      const user = await imxProvider?.getAddress() || '';
      const request: GetSignableTradeRequest = {
        order_id: id,
        user,
        fees: [{
          address: '0x8e70719571e87a328696ad099a7d9f6adc120892',
          fee_percentage: 1,
        }],
      };
      const createTradeResponse = await imxProvider?.createTrade(request);
      if (createTradeResponse) {
        setLoadingTrade(false);
        setTradeIndex(null);
        addMessage('CreateTrade', `Successfully purchased with Order ID ${id}`);
        handleCloseTrade();
      }
    } catch (err) {
      if (err instanceof Error) {
        addMessage('CreateTrade', err);
        handleCloseTrade();
      }
    }
  };

  const makeOffer = async (id: number, index: number) => {
    setLoadingTrade(true);
    setTradeIndex(index);
    setShowMakeOffer(true);
  };

  const handleMakeOfferClosed = () => {
    handleCloseTrade();
  };

  return (
    <>
      <MakeOfferModal
        showModal={showMakeOffer}
        setShowModal={setShowMakeOffer}
        order={tradeIndex ? orders[tradeIndex] : undefined}
        onClose={handleMakeOfferClosed}
      />
      <Offcanvas
        show={showTradeModal}
        onHide={handleCloseTrade}
        backdrop="static"
        placement="end"
        style={{ width: '35%' }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title><Heading>Create Trade</Heading></Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <>
            <EthBalance />
            { (!loadingOrders && orders.length >= 1)
              && (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th style={{ width: '10%' }}>ID</th>
                      <th style={{ width: '10%' }}>Image</th>
                      <th>Price</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    { orders.map((order, index) => {
                      if (!order.buy.data.quantity_with_fees) return undefined;
                      return (
                        <tr key={order.order_id}>
                          <td>{ order.order_id }</td>
                          <td>
                            <Image
                              src={order.sell.data.properties?.image_url || undefined}
                              alt={order.sell.data.properties?.name || ''}
                              width="150"
                              height="150"
                              thumbnail
                            />
                          </td>
                          <td>{ utils.formatEther(order.buy.data.quantity_with_fees).toString() }</td>
                          <td>
                            { !loadingTrade
                            && (
                              <Stack direction="horizontal" gap={3}>
                                <Button
                                  size="sm"
                                  variant="dark"
                                  onClick={() => createTrade(order.order_id, index)}
                                >
                                  Buy
                                </Button>
                                <Button
                                  size="sm"
                                  variant="dark"
                                  onClick={() => makeOffer(order.order_id, index)}
                                >
                                  Offer
                                </Button>
                              </Stack>
                            )}
                            { (loadingTrade && (index === tradeIndex))
                            && <Spinner />}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            { (!loadingOrders && orders.length < 1)
              && <Alert variant="info">No orders available to buy</Alert>}
            { loadingOrders
              && <Spinner animation="border" variant="dark" />}

          </>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default Trade;
