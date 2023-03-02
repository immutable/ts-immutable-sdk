import { BiomeThemeProvider, Button } from '@biom3/react'
import { CheckoutSDK, ConnectionProviders } from '@imtbl/checkout-sdk-web'

import { 
  ConnectWidgetOptions,
} from '@imtbl/checkout-ui-types'
import { ProviderPreference } from '@imtbl/checkout-ui-types'
import { sendConnectFailedEvent, sendConnectSuccessEvent} from './ConnectWidgetEvents'

export function ConnectWidget (props:ConnectWidgetOptions) {
  const checkout:CheckoutSDK = new CheckoutSDK()

  console.log('props', props)

  async function connectClick(providerPreference: ConnectionProviders){
    await checkout.connect({ provider: providerPreference });
    sendConnectSuccessEvent(ProviderPreference.METAMASK)
    sendConnectFailedEvent("User rejected connection request in wallet");
  }

    return (
      <BiomeThemeProvider>
        <div className="imtbl-connect-ui">
        <Button 
          onClick={() => connectClick(ConnectionProviders.METAMASK)}>
            Connect UI
          </Button>
        </div>
      </BiomeThemeProvider>
    )
}