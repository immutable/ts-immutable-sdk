import { Checkout, ChainId } from '@imtbl/checkout-sdk-web';
import { Web3Provider } from '@ethersproject/providers';

export interface SwitchNetworkProps {
  provider: Web3Provider | undefined;
}

function SwitchNetwork(props: SwitchNetworkProps) {
  const checkout: Checkout = new Checkout();
  const { provider } = props;

  async function switchNetwork(chainId: ChainId) {
    if (provider) await checkout.switchNetwork({ provider, chainId });
  }

  return (
    <div>
      <h1 className="sample-heading">Switch Network</h1>
      <div className="divider"></div>
      <div>
        <button onClick={() => switchNetwork(ChainId.ETHEREUM)}>
          Switch Network to Ethereum
        </button>
        <button onClick={() => switchNetwork(ChainId.GOERLI)}>
          Switch Network to Goerli
        </button>
        <button onClick={() => switchNetwork(ChainId.POLYGON)}>
          Switch Network to Polygon
        </button>
      </div>
    </div>
  );
}

export default SwitchNetwork;
