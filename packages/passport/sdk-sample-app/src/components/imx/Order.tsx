import { utils } from 'ethers';
import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  Alert, Button, Form, Image, InputGroup, Offcanvas, Spinner, Table,
} from 'react-bootstrap';
import { Heading } from '@biom3/react';
import { Asset, Order as OrderType, UnsignedOrderRequest } from '@imtbl/core-sdk';
import { OrderProps } from '@/types';
import { useImmutableProvider } from '@/context/ImmutableProvider';
import { useStatusProvider } from '@/context/StatusProvider';
import { usePassportProvider } from '@/context/PassportProvider';

type AssetWithSellOrder = { asset: Asset; sellOrder?: OrderType };

function Order({ show, setShow }: OrderProps) {
  const [userAssets, setUserAssets] = useState<AssetWithSellOrder[]>([]);
  const [needReload, setNeedReload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sellingPrice, setSellingPrice] = useState<string>('0.01');

  const { addMessage } = useStatusProvider();
  const { imxProvider } = usePassportProvider();
  const { coreSdkClient } = useImmutableProvider();

  const getUserAssetsWithOrder = useCallback(async () => {
    const imxWalletAddress = await imxProvider?.getAddress();
    const assets = await coreSdkClient.listAssets({ user: imxWalletAddress });
    const orders = await coreSdkClient.listOrders({
      user: imxWalletAddress,
      status: 'active',
    });
    return assets?.result.map((asset) => ({
      asset,
      sellOrder: orders.result.find(
        (sellOrder) => sellOrder.sell.data.token_id === asset.token_id,
      ),
    }));
  }, [coreSdkClient, imxProvider]);

  useEffect(() => {
    if (show) {
      (async () => {
        setLoading(true);
        setUserAssets([]);
        const assetsWithOrder = await getUserAssetsWithOrder();
        setUserAssets(assetsWithOrder);
        setNeedReload(false);
        setLoading(false);
      })();
    }
  }, [getUserAssetsWithOrder, show]);

  useEffect(() => {
    if (needReload) {
      setTimeout(() => {
        (async () => {
          const assetsWithOrder = await getUserAssetsWithOrder();
          setUserAssets(assetsWithOrder);
          setNeedReload(false);
          setLoading(false);
        })();
      }, 2000);
    }
  }, [getUserAssetsWithOrder, needReload]);

  useEffect(() => {
    (async () => {
      const assetsWithOrder = await getUserAssetsWithOrder();
      setUserAssets(assetsWithOrder);
      setLoading(false);
    })();
  }, [getUserAssetsWithOrder]);

  const handleClose = useCallback(() => {
    setShow(false);
  }, [setShow]);

  const cancelOrder = useCallback(async (id: number) => {
    if (!imxProvider) {
      return;
    }
    setLoading(true);
    try {
      await imxProvider.cancelOrder({ order_id: id });
      setNeedReload(true);
    } catch (err) {
      addMessage('Cancel Order', err);
      handleClose();
    }
  }, [imxProvider, handleClose, addMessage]);

  const createOrder = useCallback(async (asset: Asset) => {
    if (!imxProvider) {
      return;
    }
    setLoading(true);
    const request: UnsignedOrderRequest = {
      buy: {
        type: 'ETH',
        amount: utils.parseEther(sellingPrice).toString(),
      },
      sell: {
        type: 'ERC721',
        tokenId: asset.token_id,
        tokenAddress: asset.token_address,
      },
    };
    try {
      await imxProvider.createOrder(request);
      setNeedReload(true);
    } catch (err) {
      addMessage('Create Order', err);
      handleClose();
    }
  }, [imxProvider, sellingPrice, addMessage, handleClose]);

  const getOrderList = (assets: AssetWithSellOrder[]) => {
    if (loading) {
      return (
        <Spinner animation="border" variant="dark" />
      );
    }

    return (
      assets.length > 0
        ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Image Url</th>
                <th>Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {
              assets.map((userAsset, index) => (
                <tr key={userAsset.asset.id}>
                  <td>{ index }</td>
                  <td>{ userAsset.asset.name }</td>
                  <td>
                    <Image
                      src={userAsset.asset.image_url || undefined}
                      alt={userAsset.asset.name || ''}
                      width="150"
                      thumbnail
                    />
                  </td>
                  <td>
                    { userAsset.sellOrder?.buy.data.quantity_with_fees
                      ? utils.formatEther(userAsset.sellOrder?.buy.data.quantity_with_fees)
                      : (
                        <InputGroup size="sm" className="mb-3">
                          <Form.Control
                            placeholder="Selling Price"
                            aria-label="Selling Price"
                            aria-describedby="basic-addon"
                            onChange={(e) => setSellingPrice(e.target.value)}
                          />
                          <InputGroup.Text id="basic-addon">Eth</InputGroup.Text>
                          <InputGroup.Text>Default: 0.01</InputGroup.Text>
                        </InputGroup>
                      )}
                  </td>
                  <td>
                    { !userAsset.sellOrder
                      ? (
                        <Button size="sm" variant="dark" onClick={() => createOrder(userAsset.asset)}>
                          List for
                          Sell
                        </Button>
                      )
                      : (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => cancelOrder((userAsset.sellOrder as OrderType).order_id)}
                        >
                          Cancel Order
                        </Button>
                      ) }
                  </td>
                </tr>
              ))
            }
            </tbody>
          </Table>
        )
        : <Alert>You have no assets available to order</Alert>
    );
  };

  return (
    <Offcanvas
      show={show}
      onHide={handleClose}
      backdrop="static"
      placement="end"
      style={{ width: '50%' }}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>
          <Heading>Orders</Heading>
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        { getOrderList(userAssets) }
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default Order;
