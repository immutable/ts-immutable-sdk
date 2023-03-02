import { CheckoutSDK, ConnectParams } from '@imtbl/checkout-sdk-web'
import { Button, Heading } from '@biom3/react'

export enum ConnectionProviders {
  METAMASK = "metamask"
}

function ConnectSDK() {
  const checkout:CheckoutSDK = new CheckoutSDK()
 
  return (
    <div className="Connect">
      <Heading size="small" className="sample-heading">Checkout Connect (SDK)</Heading>
      <div className="divider"></div>
      <Button 
      onClick={() => connectClick(checkout)}>
        Connect SDK
      </Button>
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

export default ConnectSDK;
