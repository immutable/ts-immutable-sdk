import {
  Checkout,
  NetworkFilterTypes,
  TokenFilterTypes,
  WalletFilterTypes,
} from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';

export interface AllowedListProps {
  provider: Web3Provider | undefined;
}

function GetAllowedLists(props: AllowedListProps) {
  const checkout: Checkout = new Checkout();
  const { provider } = props;

  async function getNetworkAllowedList() {
    if (provider) {
      try {
        const info = await checkout.getNetworkAllowList({
          type: NetworkFilterTypes.ALL,
        });
        console.log(info);
      } catch (error: any) {
        console.log(error);
      }
    }
  }
  async function getWalletsAllowedList() {
    if (provider) {
      try {
        const info = await checkout.getWalletsAllowList({
          type: WalletFilterTypes.ALL,
        });
        console.log(info);
      } catch (error: any) {
        console.log(error);
      }
    }
  }
  async function getTokensAllowedList() {
    if (provider) {
      try {
        const info = await checkout.getTokenAllowList({
          type: TokenFilterTypes.ALL,
          chainId: 1,
        });
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
        <button onClick={() => getNetworkAllowedList()}>
          Network allowed list
        </button>
        <button onClick={() => getWalletsAllowedList()}>
          Wallets allowed list
        </button>
        <button onClick={() => getTokensAllowedList()}>
          Tokens allowed list
        </button>
      </div>
    </div>
  );
}

export default GetAllowedLists;
