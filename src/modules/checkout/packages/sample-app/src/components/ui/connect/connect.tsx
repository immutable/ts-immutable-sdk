//import '@imtbl/checkout-ui/dist/imtbl-connect-widget' 


import { useEffect } from 'react';
import { CheckoutSDK, ConnectParams, ConnectionProviders } from '@imtbl/checkout-sdk-web'
import { Button, Heading } from '@biom3/react'

import { ConnectWidgetOptions, 
        ConnectWidgetParams, 
        ConnectEventType, 
        ConnectionSuccess, 
        ConnectionFailed, 
        IMTBLWidgetEvents,
        ConnectWidget
} from '@imtbl/checkout-ui'

function ConnectUI() {
  const checkout:CheckoutSDK = new CheckoutSDK()

  const widgetOptions:ConnectWidgetOptions = {
    elementId: "imtbl-checkout-connect",
    theme: 'LIGHT',
    params: {
      providerPreference: ConnectionProviders.METAMASK
    } as ConnectWidgetParams
  }


  useEffect( () => {
    //window.IMTBLConnectWidget.mount(widgetOptions)

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
      <h1 className="sample-heading">Checkout Connect (Injected Widget)</h1>
      <div className="divider"></div>
      <span id="imtbl-checkout-connect"></span>
      <h1 className="sample-heading">Checkout Connect (React Component)</h1>
       <ConnectWidget params={widgetOptions.params} theme={widgetOptions.theme} ></ConnectWidget> 
    </div>
  );
}

async function connectClick(checkout:CheckoutSDK) {
  const params:ConnectParams = {
    providerPreference: ConnectionProviders.METAMASK
  }

  try {
    await checkout.connect(params)
  } catch(err) {
    console.error(err)
  }
  
}


export default ConnectUI;
