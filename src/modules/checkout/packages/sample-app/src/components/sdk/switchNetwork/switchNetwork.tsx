import { CheckoutSDK, Network } from '@imtbl/checkout-sdk-web'

export interface SwitchNetworkProps {
  provider: any;
}

function SwitchNetwork(props: SwitchNetworkProps) {
  const checkout:CheckoutSDK = new CheckoutSDK()
  const {provider} = props;


  async function switchNetwork(network: Network) {
    await checkout.switchNetwork({provider, network})
  }
 
  return (
    <div>
      <h1 className="sample-heading">Checkout Connect (SDK)</h1>
      <div className="divider"></div>
      <div>
        <button 
          onClick={() => switchNetwork(Network.ETHEREUM)}>
          Switch Network to Ethereum
        </button>
        <button 
          onClick={() => switchNetwork(Network.GOERLI)}>
          Switch Network to Goerli
        </button>
        <button 
          onClick={() => switchNetwork(Network.POLYGON)}>
          Switch Network to Polygon
        </button>
        </div>
    </div>
  );
}

export default SwitchNetwork;
