import { CheckoutSDK, ConnectionProviders } from '@imtbl/checkout-sdk-web'

export function TestWidget() {

  const checkout = new CheckoutSDK()

  async function connectClick() {
    await checkout.connect({
      providerPreference: ConnectionProviders.METAMASK
    })
  }

  return(
    <div>
    <h1>Test Widget HOT</h1>


    <button 
        onClick={() => connectClick()}>
        Connect Wallet
      </button>
    </div>
    
  )
}