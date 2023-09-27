import { useEffect, useRef } from 'react';
import { IMTBLWidgetEvents } from '@imtbl/checkout-widgets';

const useParams = () => {
  const urlParams = new URLSearchParams(window.location.search);

  const amount = urlParams.get('amount') as string;
  const envId = urlParams.get('envId') as string;
  const fromCurrency = urlParams.get('fromCurrency') as string;
  const items = urlParams.get('items') as string;

  console.log('amount', amount);
  console.log('envId', envId);
  console.log('fromCurrency', fromCurrency);
  console.log('items', items);

  return {
    amount,
    envId,
    fromCurrency,
    items,
  };
};

const handleEvent = ((event: CustomEvent) => {
  console.log('@@@@@ event', event.detail);

  // send the window opener post message with type and data
  window?.opener.postMessage(
    {
      type: 'mint_sale_popup_event',
      data: event.detail,
      identifier: 'primary-revenue-widget-events',
    },
    '*'
  );
}) as EventListener;

function PrimaryRevenueWidget() {
  const {  amount, envId, fromCurrency, items } = useParams();

  console.log('@@@@@ items', JSON.parse(items));
  const componentRef = useRef(null);

  useEffect(() => {
    window.addEventListener(
      IMTBLWidgetEvents.IMTBL_PRIMARY_REVENUE_WIDGET_EVENT,
      handleEvent
    );

    // Assuming window.sharedData.passportInstance contains the necessary data
    const passportInstance = window?.opener?.sharedData?.passportInstance;

    console.log('@@@@@ passportInstance', passportInstance);

    if (passportInstance && componentRef.current) {
      (
        componentRef.current as unknown as ImmutableWebComponent
      ).addPassportOption(passportInstance);
    }

    return () => {
      window.removeEventListener(
        IMTBLWidgetEvents.IMTBL_PRIMARY_REVENUE_WIDGET_EVENT,
        handleEvent
      );
    };
  }, []);

  return (
    <imtbl-primary-revenue
      ref={componentRef}
      amount={amount}
      envId={envId}
      fromCurrency={fromCurrency}
      items={items}
      widgetConfig="{theme: 'dark', environment: 'sandbox'}"
    />
  );
}

export default PrimaryRevenueWidget;
