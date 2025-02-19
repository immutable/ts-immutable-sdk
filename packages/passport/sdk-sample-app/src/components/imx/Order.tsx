import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, Button, Form, Image, InputGroup, Offcanvas, Spinner, Stack, Table,
} from 'react-bootstrap';
import { Heading } from '@biom3/react';
import { imx } from '@imtbl/generated-clients';
import { UnsignedOrderRequest } from '@imtbl/x-client';
import { ModalProps } from '@/types';
import { useImmutableProvider } from '@/context/ImmutableProvider';
import { useStatusProvider } from '@/context/StatusProvider';
import { usePassportProvider } from '@/context/PassportProvider';
import ViewOffersModal from '@/components/imx/ViewOffersModal';
import { MARKETPLACE_FEE_PERCENTAGE, MARKETPLACE_FEE_RECIPIENT } from '@/config';
import { formatEther, parseEther } from 'ethers';

type OrderType = imx.Order;
type AssetWithSellOrder = { asset: imx.Asset; sellOrder?: OrderType; };
type AssetWithOffer = { asset: imx.TokenData; offerOrder?: OrderType; };

type AssetsWithOrders = {
  sellAssets: AssetWithSellOrder[];
  offerAssets: AssetWithOffer[];
};

function Order({ showModal, setShowModal }: ModalProps) {
  const [showViewOffers, setShowViewOffers] = useState<boolean>(false);
  const [offerBuyTokenAddress, setOfferBuyTokenAddress] = useState<string>('');
  const [offerBuyTokenId, setOfferBuyTokenId] = useState<string>('');
  const [userAssets, setUserAssets] = useState<AssetsWithOrders>();
  const [loading, setLoading] = useState(true);
  const [sellingPrice, setSellingPrice] = useState<string>('0.01');

  const { addMessage } = useStatusProvider();
  const { imxProvider } = usePassportProvider();
  const { sdkClient } = useImmutableProvider();

  const getUserAssetsWithOrder = useCallback(async () => {
    const imxWalletAddress = await imxProvider?.getAddress();
    const assets = await sdkClient.listAssets({ user: imxWalletAddress });
    const orders = await sdkClient.listOrders({
      user: imxWalletAddress,
      status: 'active',
      auxiliaryFeePercentages: MARKETPLACE_FEE_PERCENTAGE.toString(),
      auxiliaryFeeRecipients: MARKETPLACE_FEE_RECIPIENT,
    });
    const assetsWithOffers = orders.result.filter(
      (order) => order.buy.type === 'ERC721',
    ).map((offerOrder) => ({
      asset: offerOrder.buy.data,
      offerOrder,
    }));
    const sellOrders = assets?.result.map((asset) => ({
      asset,
      sellOrder: orders.result.find(
        (sellOrder) => sellOrder.sell.data.token_id === asset.token_id,
      ),
    }));
    return {
      sellAssets: sellOrders,
      offerAssets: assetsWithOffers,
    };
  }, [sdkClient, imxProvider]);

  useEffect(() => {
    if (showModal) {
      (async () => {
        setLoading(true);
        setUserAssets({
          sellAssets: [],
          offerAssets: [],
        });
        const assetsWithOrder = await getUserAssetsWithOrder();
        setUserAssets(assetsWithOrder);
        setLoading(false);
      })();
    }
  }, [getUserAssetsWithOrder, showModal]);

  const handleClose = useCallback(() => {
    setShowModal(false);
  }, [setShowModal]);

  const cancelOrder = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const result = await imxProvider?.cancelOrder({ order_id: id });
      addMessage('Cancel Order', result);
    } catch (err) {
      addMessage('Cancel Order', err);
    } finally {
      handleClose();
    }
  }, [imxProvider, handleClose, addMessage]);

  const createOrder = useCallback(async (asset: imx.Asset) => {
    setLoading(true);
    const request: UnsignedOrderRequest = {
      buy: {
        type: 'ETH',
        amount: parseEther(sellingPrice).toString(),
      },
      sell: {
        type: 'ERC721',
        tokenId: asset.token_id,
        tokenAddress: asset.token_address,
      },
      fees: [{
        address: MARKETPLACE_FEE_RECIPIENT,
        fee_percentage: MARKETPLACE_FEE_PERCENTAGE,
      }],
    };
    try {
      const result = await imxProvider?.createOrder(request);
      addMessage('Create Order', result);
    } catch (err) {
      addMessage('Create Order', err);
    } finally {
      handleClose();
    }
  }, [imxProvider, sellingPrice, addMessage, handleClose]);

  const handleViewOffersClosed = () => {
    handleClose();
  };

  const viewOffers = useCallback(async (buyTokenAddress: string, buyTokenId: string) => {
    setLoading(true);
    setOfferBuyTokenAddress(buyTokenAddress);
    setOfferBuyTokenId(buyTokenId);
    setShowViewOffers(true);
  }, []);

  const getOrderList = (assets: AssetWithSellOrder[]) => (
    assets.length > 0
      ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Image</th>
              <th style={{ width: '200px' }}>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {
              assets.map((userAsset, index) => (
                <tr key={userAsset.asset.id}>
                  <td>{index}</td>
                  <td>{userAsset.asset.name}</td>
                  <td>
                    <Image
                      src={userAsset.asset.image_url || undefined}
                      alt={userAsset.asset.name || ''}
                      width="150"
                      thumbnail
                    />
                  </td>
                  <td>
                    {userAsset.sellOrder?.buy.data.quantity_with_fees
                      ? formatEther(userAsset.sellOrder?.buy.data.quantity_with_fees)
                      : (
                        <InputGroup size="sm" className="mb-3">
                          <Stack>
                            <Form.Label>
                              Selling Price
                            </Form.Label>
                            <Stack direction="horizontal">
                              <Form.Control
                                defaultValue={sellingPrice}
                                placeholder="Selling Price"
                                aria-label="Selling Price"
                                aria-describedby="basic-addon"
                                onChange={(e) => setSellingPrice(e.target.value)}
                              />
                              <InputGroup.Text id="basic-addon">Eth</InputGroup.Text>
                            </Stack>
                          </Stack>
                        </InputGroup>
                      )}
                  </td>
                  <td>
                    <Stack gap={3}>
                      {!userAsset.sellOrder
                        ? (
                          <Button size="sm" variant="dark" onClick={() => createOrder(userAsset.asset)}>
                            Sell
                          </Button>
                        )
                        : (
                          <>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => cancelOrder((userAsset.sellOrder as OrderType).order_id)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              variant="dark"
                              onClick={() => (
                                viewOffers(userAsset.asset.token_address, userAsset.asset.token_id)
                              )}
                            >
                              Offers
                            </Button>
                          </>
                        )}
                    </Stack>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </Table>
      )
      : <Alert>You have no assets available to order</Alert>
  );

  const getOfferList = (assets: AssetWithOffer[]) => (
    assets.length > 0
      ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>OrderID</th>
              <th>Name</th>
              <th>Image</th>
              <th style={{ width: '200px' }}>Offer Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {
              assets.map((o, index) => (
                <tr key={o.asset.id}>
                  <td>{index}</td>
                  <td>{o.offerOrder?.order_id}</td>
                  <td>{o.asset?.properties?.name}</td>
                  <td>
                    <Image
                      src={o.asset?.properties?.image_url || undefined}
                      alt={o.asset?.properties?.name || ''}
                      width="150"
                      thumbnail
                    />
                  </td>
                  <td>
                    {o.offerOrder?.buy.data.quantity_with_fees
                      ? formatEther(o.offerOrder?.buy?.data.quantity_with_fees)
                      : (
                        <InputGroup size="sm" className="mb-3">
                          <Stack>
                            <Form.Label>
                              {sellingPrice}
                              {' '}
                              ETH
                            </Form.Label>
                          </Stack>
                        </InputGroup>
                      )}
                  </td>
                  <td>
                    <Stack gap={3}>
                      {o.offerOrder && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => cancelOrder((o.offerOrder as OrderType).order_id)}
                        >
                          Cancel Offer
                        </Button>
                      )}
                    </Stack>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </Table>
      )
      : <Alert>You have no assets available to order</Alert>
  );

  return (
    <>
      <ViewOffersModal
        showModal={showViewOffers}
        setShowModal={setShowViewOffers}
        buyTokenAddress={offerBuyTokenAddress}
        buyTokenId={offerBuyTokenId}
        onClose={handleViewOffersClosed}
      />
      <Offcanvas
        show={showModal}
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

        {loading
          ? <Spinner animation="border" variant="dark" />
          : (
            <Offcanvas.Body>
              {getOrderList(userAssets?.sellAssets || [])}
              <Offcanvas.Title>
                <Heading>Offers</Heading>
              </Offcanvas.Title>
              {getOfferList(userAssets?.offerAssets || [])}
            </Offcanvas.Body>
          )}
      </Offcanvas>
    </>
  );
}

export default Order;
