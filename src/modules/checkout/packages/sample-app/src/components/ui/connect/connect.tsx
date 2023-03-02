import { useEffect } from 'react';
import { CheckoutSDK, ConnectParams } from '@imtbl/checkout-sdk-web'
import { Button, Heading } from '@biom3/react'

import { ConnectWidgetOptions, 
        ConnectWidgetParams, 
        ProviderPreference, 
        ConnectEventType, 
        ConnectionSuccess, 
        ConnectionFailed, 
        IMTBLWidgetEvents} from '@imtbl/checkout-ui-types'

export enum ConnectionProviders {
  METAMASK = "metamask"
}

function ConnectUI() {
  const checkout:CheckoutSDK = new CheckoutSDK()

  useEffect( () => {
    // Anything in here is fired on component mount.

    const widgetOptions:ConnectWidgetOptions = {
      elementId: "imtbl-checkout-connect",
      theme: 'LIGHT',
      params: {
        providerPreference: ProviderPreference.METAMASK
      } as ConnectWidgetParams
    }

    window.IMTBLConnectWidget.mount(widgetOptions)

    // Add event listeners for the IMXConnectWidget and handle event types appropriately
    const handleConnectEvent = (((event: CustomEvent) => {
      console.log(event)
      console.log("Getting data from within the event");
      switch(event.detail.type) {
        case ConnectEventType.SUCCESS: {
          const eventData = event.detail.data as ConnectionSuccess
          console.log(eventData.providerPreference);
          console.log(eventData.timestamp)
          break;
        }
        case ConnectEventType.FAILURE: {
          const eventData = event.detail.data as ConnectionFailed
          console.log(eventData.reason);
          console.log(eventData.timestamp)
          break;
        } 
        default:
        console.log('did not match any expected event type')
      }
    }) as EventListener)

    window.addEventListener(IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT, handleConnectEvent);
    return () =>{
      window.removeEventListener(IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT, handleConnectEvent);
    }
  }, []);
 
  return (
    <div className="Connect">
      <Heading size="small" className="sample-heading">Checkout Connect (UI)</Heading>
      <div className="divider"></div>
      <span id="imtbl-checkout-connect"></span>
    </div>
  );
}

async function connectClick(checkout:CheckoutSDK) {
  const params:ConnectParams = {
    provider: ConnectionProviders.METAMASK
  }

  try {
    await checkout.connect(params)
  } catch(err) {
    console.error(err)
  }
  
}

export default ConnectUI;
