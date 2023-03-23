import { CheckoutSDK, ConnectParams } from '@imtbl/checkout-sdk-web'
import {Web3Provider} from '@ethersproject/providers'

export enum ConnectionProviders {
  METAMASK = "metamask"
}

interface ConnectProps {
  setProvider: (provider: Web3Provider) => void;  
}

function Connect(props: ConnectProps) {
  const checkout:CheckoutSDK = new CheckoutSDK();
  const {setProvider} = props;

  async function connectClick(checkout:CheckoutSDK) {
    const params:ConnectParams = {
      providerPreference: ConnectionProviders.METAMASK
    }
  
    try {
      const connectRes = await checkout.connect(params);
      setProvider(connectRes.provider);
    } catch(err) {
      console.error(err)
    }
  }

  return (
    <div className="Connect">
      <h1 className="sample-heading">Checkout Connect (SDK)</h1>
      <div className="divider"></div>
      <button 
        onClick={() => connectClick(checkout)}>
        Connect Wallet
      </button>
    </div>
  );
}

export default Connect;
