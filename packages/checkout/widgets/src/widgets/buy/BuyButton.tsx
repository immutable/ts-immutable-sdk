import React from 'react';
import { GetOrderResponse, Orderbook, BuyWidgetViews } from './BuyWidget';
import { Button } from '@biom3/react';
import { Web3Provider } from '@ethersproject/providers';
import { Checkout, ChainId } from '@imtbl/checkout-sdk-web';
import { sendBuySuccessEvent, sendBuyFailedEvent } from './BuyWidgetEvents';

export interface BuyButtonProps {
  order: GetOrderResponse;
  provider: Web3Provider;
  checkout: Checkout;
  orderbook: Orderbook;
  chainId: ChainId;
  updateView: (view: BuyWidgetViews, err?: any) => void;
}

export default function BuyButton({
  order,
  provider,
  checkout,
  orderbook,
  chainId,
  updateView,
}: BuyButtonProps) {
  const buyAsset = async () => {
    if (!provider) return;

    try {
      const transaction = await orderbook.createOrder(chainId, order.id);

      await checkout.sendTransaction({
        provider,
        transaction,
      });

      sendBuySuccessEvent();
      updateView(BuyWidgetViews.SUCCESS);
    } catch (err: any) {
      // Intentionally making this succeed at the moment since the
      // transaction will always error out currently
      sendBuyFailedEvent(err);
      updateView(BuyWidgetViews.FAIL, err);
    }
  };

  return (
    <Button
      testId="buy_asset_button"
      variant="primary"
      onClick={async function () {
        await buyAsset();
      }}
      sx={{ width: '100%', mt: 'base.spacing.x2' }}
    >
      Buy Asset
    </Button>
  );
}
