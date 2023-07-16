import { formatEther } from 'ethers';
import React, { useEffect, useState } from 'react';
import {
  Alert, Button, Image, Offcanvas, Spinner, Table,
} from 'react-bootstrap';
import { Heading } from '@biom3/react';
import { GetSignableTradeRequest, Order } from '@imtbl/core-sdk';
import { TradeProps } from '@/types';
import { usePassportProvider } from '@/context/PassportProvider';
import { useImmutableProvider } from '@/context/ImmutableProvider';
import { useStatusProvider } from '@/context/StatusProvider';

function Trade({ showTrade, setShowTrade }: TradeProps) {
  const [tradeIndex, setTradeIndex] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);
  const [loadingTrade, setLoadingTrade] = useState<boolean>(false);

  const { addMessage } = useStatusProvider();
  const { coreSdkClient } = useImmutableProvider();
  const { imxProvider } = usePassportProvider();

  useEffect(() => {
    (async () => {
      if (coreSdkClient && showTrade) {
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
  }, [showTrade, coreSdkClient]);

  const handleClose = () => {
    setLoadingTrade(false);
    setShowTrade(false);
  };

  const createTrade = async (id: number, index: number) => {
    setLoadingTrade(true);
    setTradeIndex(index);
    try {
      const user = await imxProvider?.getAddress() || '';
      const request: GetSignableTradeRequest = {
        order_id: id,
        user,
      };
      const createTradeResponse = await imxProvider?.createTrade(request);
      if (createTradeResponse) {
        setLoadingTrade(false);
        setTradeIndex(null);
        addMessage(`Successfully purchased with Order ID ${id}`);
        handleClose();
      }
    } catch (err) {
      if (err instanceof Error) {
        addMessage(err.toString());
        handleClose();
      }
    }
  };

  return (
    <Offcanvas show={showTrade} onHide={handleClose} backdrop="static" placement="end" style={{ width: '35%' }}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title><Heading>Create Trade</Heading></Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <>
          { (!loadingOrders && orders.length >= 1)
              && (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Image Url</th>
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
                        <td>{ formatEther(order.buy.data.quantity_with_fees).toString() }</td>
                        <td>
                          { !loadingTrade
                                && (
                                <Button size="sm" variant="dark" onClick={() => createTrade(order.order_id, index)}>
                                  Buy
                                </Button>
                                )}
                          { (loadingTrade && (index !== tradeIndex))
                                && (
                                <Button
                                  size="sm"
                                  variant="dark"
                                  onClick={() => createTrade(order.order_id, index)}
                                  disabled
                                >
                                  Buy
                                </Button>
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
  );
}

export default Trade;
