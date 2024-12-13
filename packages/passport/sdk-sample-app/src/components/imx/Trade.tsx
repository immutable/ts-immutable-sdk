import React, { useEffect, useState } from 'react';
import {
  Alert, Button, Form, Image, Offcanvas, Spinner, Stack, Table,
} from 'react-bootstrap';
import { Heading, TextInput } from '@biom3/react';
import { imx } from '@imtbl/generated-clients';
import { ModalProps } from '@/types';
import { usePassportProvider } from '@/context/PassportProvider';
import { useImmutableProvider } from '@/context/ImmutableProvider';
import { useStatusProvider } from '@/context/StatusProvider';
import EthBalance from '@/components/imx/EthBalance';
import MakeOfferModal from '@/components/imx/MakeOfferModal';
import { MARKETPLACE_FEE_PERCENTAGE, MARKETPLACE_FEE_RECIPIENT } from '@/config';
import { formatEther } from 'ethers';

function Trade({ showModal: showTradeModal, setShowModal: setShowTradeModal }: ModalProps) {
  const [sellTokenName, setSellTokenName] = useState<string>('');
  const [tradeIndex, setTradeIndex] = useState<number | null>(null);
  const [orders, setOrders] = useState<imx.Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);
  const [loadingTrade, setLoadingTrade] = useState<boolean>(false);
  const [showMakeOffer, setShowMakeOffer] = useState<boolean>(false);

  const { addMessage } = useStatusProvider();
  const { sdkClient } = useImmutableProvider();
  const { imxProvider } = usePassportProvider();

  const getOrders = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (sdkClient && showTradeModal) {
      setLoadingOrders(true);
      setOrders([]);

      const result = await sdkClient.listOrders({
        status: 'active',
        orderBy: 'updated_at',
        direction: 'desc',
        sellTokenType: 'ERC721',
        sellTokenName,
        auxiliaryFeePercentages: MARKETPLACE_FEE_PERCENTAGE.toString(),
        auxiliaryFeeRecipients: MARKETPLACE_FEE_RECIPIENT,
      });
      setOrders(result.result);
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    getOrders().catch(console.error);
  }, [showTradeModal, sdkClient, getOrders]);

  const handleCloseTrade = () => {
    setLoadingTrade(false);
    setShowTradeModal(false);
  };

  const createTrade = async (id: number, index: number) => {
    setLoadingTrade(true);
    setTradeIndex(index);
    try {
      const user = await imxProvider?.getAddress() || '';
      const request: imx.GetSignableTradeRequest = {
        order_id: id,
        user,
        fees: [{
          address: MARKETPLACE_FEE_RECIPIENT,
          fee_percentage: MARKETPLACE_FEE_PERCENTAGE,
        }],
      };
      const createTradeResponse = await imxProvider?.createTrade(request);
      addMessage('Create Trade', createTradeResponse);
    } catch (err) {
      addMessage('Create Trade', err);
    } finally {
      handleCloseTrade();
    }
  };

  const makeOffer = async (index: number) => {
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
        order={tradeIndex !== null ? orders[tradeIndex] : undefined}
        onClose={handleMakeOfferClosed}
      />
      <Offcanvas
        show={showTradeModal}
        onHide={handleCloseTrade}
        backdrop="static"
        placement="end"
        style={{ width: '50%' }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title><Heading>Create Trade</Heading></Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Stack gap={3}>
            <EthBalance />
            <Form onSubmit={getOrders}>
              <TextInput
                hideClearValueButton
                name="Search asset name"
                placeholder="Search asset name"
                value={sellTokenName}
                onChange={(e) => { setSellTokenName(e.target.value); }}
              >
                <TextInput.Button type="submit">Search</TextInput.Button>
              </TextInput>
            </Form>
            { loadingOrders && <Spinner animation="border" variant="dark" /> }
            { !loadingOrders && (orders.length >= 1 ? (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
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
                        <td>{ order.sell.data.properties?.name }</td>
                        <td>
                          <Image
                            src={order.sell.data.properties?.image_url || undefined}
                            alt={order.sell.data.properties?.name || ''}
                            height="150"
                            thumbnail
                          />
                        </td>
                        <td>{ formatEther(order.buy.data.quantity_with_fees).toString() }</td>
                        <td>
                          { !loadingTrade
                          && (
                            <Stack gap={3}>
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
                                onClick={() => makeOffer(index)}
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
            ) : <Alert variant="info">No results found</Alert>) }
          </Stack>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default Trade;
