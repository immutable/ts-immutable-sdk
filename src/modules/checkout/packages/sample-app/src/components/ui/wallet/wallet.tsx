import { ConnectionProviders } from "@imtbl/checkout-sdk-web";
import { WalletWidget, WalletWidgetOptions } from "@imtbl/checkout-ui";

function WalletUI() {

  const widgetOptions: WalletWidgetOptions = {
    elementId: "imtbl-checkout-connect",
    theme: 'LIGHT',
    params: {
      providerPreference: ConnectionProviders.METAMASK
    }
  }
  
  return(
    <div className="Connect">
      <h1 className="sample-heading">Checkout Wallet (React Component)</h1>
       <WalletWidget params={widgetOptions.params} theme={widgetOptions.theme} />
    </div>
  )
}

export default WalletUI;
