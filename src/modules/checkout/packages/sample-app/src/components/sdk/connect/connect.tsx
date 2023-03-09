import { CheckoutSDK, ConnectParams } from '@imtbl/checkout-sdk-web'
import { Button, Heading } from '@biom3/react'

export enum ConnectionProviders {
  METAMASK = "metamask"
}

interface ConnectProps {
  setProvider: (provider: any) => void;  
}

function Connect(props: ConnectProps) {
  const checkout:CheckoutSDK = new CheckoutSDK();
  const {setProvider} = props;

  async function connectClick(checkout:CheckoutSDK) {
    const params:ConnectParams = {
      providerPreference: ConnectionProviders.METAMASK
    }
  
    try {
      const provider = await checkout.connect(params);
      setProvider(provider);
    } catch(err) {
      console.error(err)
    }
  }

  return (
    <div className="Connect">
      <Heading size="small" className="sample-heading">Checkout Connect (SDK)</Heading>
      <div className="divider"></div>
      <Button 
        onClick={() => connectClick(checkout)}>
        Connect Wallet
      </Button>
    </div>
  );
}

export default Connect;
