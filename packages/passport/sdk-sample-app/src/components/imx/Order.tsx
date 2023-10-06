import { utils } from 'ethers';
import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  Alert, Button, Form, Image, InputGroup, Offcanvas, Spinner, Stack, Table,
} from 'react-bootstrap';
import { Heading } from '@biom3/react';
import { Asset, Order as OrderType, UnsignedOrderRequest } from '@imtbl/core-sdk';
import { ModalProps } from '@/types';
import { useImmutableProvider } from '@/context/ImmutableProvider';
import { useStatusProvider } from '@/context/StatusProvider';
import { usePassportProvider } from '@/context/PassportProvider';
import ViewOffersModal from '@/components/imx/ViewOffersModal';

type AssetWithSellOrder = { asset: Asset; sellOrder?: OrderType };

function Order({ showModal, setShowModal }: ModalProps) {
  const [showViewOffers, setShowViewOffers] = useState<boolean>(false);
  const [offerBuyTokenAddress, setOfferBuyTokenAddress] = useState<string>('');
  const [offerBuyTokenId, setOfferBuyTokenId] = useState<string>('');
  const [userAssets, setUserAssets] = useState<AssetWithSellOrder[]>([]);
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
    if (showModal) {
      (async () => {
        setLoading(true);
        setUserAssets([]);
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

  const createOrder = useCallback(async (asset: Asset) => {
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
      fees: [{
        address: '0x8e70719571e87a328696ad099a7d9f6adc120892',
        fee_percentage: 1,
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
                      { !userAsset.sellOrder
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
  };

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
        <Offcanvas.Body>
          { getOrderList(userAssets) }
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default Order;
