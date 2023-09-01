import { useEffect } from 'react';
import { IMTBLWidgetEvents } from '@imtbl/checkout-widgets';

// http://localhost:3000/mint-sale?amount=0.001&fromContractAddress=0x21B51Ec6fB7654B7e59e832F9e9687f29dF94Fb8&envId=123&fromCurrency=USDC&items=%5B%7B%22id%22%3A%2260%22%2C%22qty%22%3A1%2C%22price%22%3A%220.5%22%2C%22name%22%3A%22Poliwag%22%2C%22image%22%3A%22https%3A%2F%2Fpokemon-nfts.s3.ap-southeast-2.amazonaws.com%2Fimages%2F60.png%22%2C%22description%22%3A%22Poliwag%22%7D%2C%7B%22id%22%3A%2261%22%2C%22qty%22%3A1%2C%22price%22%3A%221%22%2C%22name%22%3A%22Poliwhirl%22%2C%22image%22%3A%22https%3A%2F%2Fpokemon-nfts.s3.ap-southeast-2.amazonaws.com%2Fimages%2F61.png%22%2C%22description%22%3A%22Poliwhirl%22%7D%2C%7B%22id%22%3A%2262%22%2C%22qty%22%3A1%2C%22price%22%3A%222%22%2C%22name%22%3A%22Poliwrath%22%2C%22image%22%3A%22https%3A%2F%2Fpokemon-nfts.s3.ap-southeast-2.amazonaws.com%2Fimages%2F62.png%22%2C%22description%22%3A%22Poliwrath%22%7D%5D

const useParams = () => {
  const urlParams = new URLSearchParams(window.location.search);

  const amount = urlParams.get('amount') as string;
  const envId = urlParams.get('envId') as string;
  const fromCurrency = urlParams.get('fromCurrency') as string;
  // @deprecated
  const fromContractAddress = urlParams.get('fromContractAddress') as string;
  const items = urlParams.get('items') as string;

  console.log('amount', amount);
  console.log('envId', envId);
  console.log('fromCurrency', fromCurrency);
  console.log('fromContractAddress', fromContractAddress);
  console.log('items', items);

  return {
    amount,
    envId,
    fromCurrency,
    fromContractAddress,
    items,
  };
};

const handleEvent = ((event: CustomEvent) => {
  console.log('event', event.detail);
  // send the window opener post message with type and data
  window?.opener.postMessage(
    {
      type: 'mint_sale_popup_event',
      data: event.detail,
    },
    '*'
  );
}) as EventListener;

function PrimaryRevenueWidget() {
  const { amount, envId, fromCurrency, fromContractAddress, items } =
    useParams();

  useEffect(() => {
    window.addEventListener(
      IMTBLWidgetEvents.IMTBL_PRIMARY_REVENUE_WIDGET_EVENT,
      handleEvent
    );

    return () => {
      window.removeEventListener(
        IMTBLWidgetEvents.IMTBL_PRIMARY_REVENUE_WIDGET_EVENT,
        handleEvent
      );
    };
  }, []);

  return (
    <imtbl-primary-revenue
      amount={amount}
      envId={envId}
      fromCurrency={fromCurrency}
      items={items}
      fromContractAddress={fromContractAddress}
      widgetConfig="{theme: 'dark', environment: 'sandbox'}"
    />
  );
}

export default PrimaryRevenueWidget;
