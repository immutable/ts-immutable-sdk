import { useEffect } from 'react';
import { IMTBLWidgetEvents } from '@imtbl/checkout-widgets';

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
