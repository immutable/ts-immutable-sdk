import { CheckoutSDK, Network } from '@imtbl/checkout-sdk-web'
import {Web3Provider} from '@ethersproject/providers'

export interface SwitchNetworkProps {
  provider: Web3Provider | undefined;
}

function SwitchNetwork(props: SwitchNetworkProps) {
  const checkout:CheckoutSDK = new CheckoutSDK();
  const {provider} = props;


  async function switchNetwork(network: Network) {
    if(provider) await checkout.switchNetwork({provider, network});
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
