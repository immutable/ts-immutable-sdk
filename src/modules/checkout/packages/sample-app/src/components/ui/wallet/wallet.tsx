import { ConnectionProviders } from "@imtbl/checkout-sdk-web";
import { WalletWidgetOptions, WalletWidgetParams, WalletWidget } from "@imtbl/checkout-ui";

function WalletUI() {

  const widgetOptions:WalletWidgetOptions = {
    elementId: "imtbl-checkout-connect",
    theme: 'LIGHT',
    params: {
      providerPreference: ConnectionProviders.METAMASK
    } as WalletWidgetParams
  }
  
  return(
    <div className="Connect">
      <h1 className="sample-heading">Checkout Wallet (React Component)</h1>
       <WalletWidget params={widgetOptions.params} theme={widgetOptions.theme} ></WalletWidget> 
    </div>
  )
}

export default WalletUI;
