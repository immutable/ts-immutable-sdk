import { Checkout, ChainId } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';

export interface SwitchNetworkProps {
  provider: Web3Provider | undefined;
}

function SwitchNetwork(props: SwitchNetworkProps) {
  const checkout: Checkout = new Checkout();
  const { provider } = props;

  async function switchNetwork(chainId: ChainId) {
    if (provider)
      try {
        await checkout.switchNetwork({ provider, chainId });
      } catch (err: any) {
        console.error(err);
        console.log(err.type);
        console.log(err.data);
      }
  }

  async function getNetworkInfo() {
    if (provider) {
      try {
        const info = await checkout.getNetworkInfo({ provider });
        console.log(info);
      } catch (error: any) {
        console.log(error);
      }
    }
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
        <button onClick={() => getNetworkInfo()}>Get Network info</button>
      </div>
    </div>
  );
}

export default SwitchNetwork;
