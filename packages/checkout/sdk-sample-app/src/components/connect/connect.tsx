import { Checkout, ConnectParams } from '@imtbl/checkout-sdk-web';
import { Web3Provider } from '@ethersproject/providers';

export enum ConnectionProviders {
  METAMASK = 'metamask',
}

interface ConnectProps {
  setProvider: (provider: Web3Provider) => void;
}

function Connect(props: ConnectProps) {
  const checkout: Checkout = new Checkout();
  const { setProvider } = props;

  async function connectClick(checkout: Checkout) {
    const params: ConnectParams = {
      providerPreference: ConnectionProviders.METAMASK,
    };

    try {
      const connectRes = await checkout.connect(params);
      setProvider(connectRes.provider);
    } catch (err: any) {
      console.error(err);
      console.log(err.type); // inspect type
      console.log(err.data); // inspect data
    }
  }

  return (
    <div className="Connect">
      <h1 className="sample-heading">Connect</h1>
      <div className="divider"></div>
      <button onClick={() => connectClick(checkout)}>Connect Wallet</button>
    </div>
  );
}

export default Connect;
