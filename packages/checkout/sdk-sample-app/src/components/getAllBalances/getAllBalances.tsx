import {
  ChainId,
  Checkout,
  GetAllBalancesParams,
  GetBalanceResult,
} from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { useState } from 'react';

interface BalanceProps {
  provider: Web3Provider | undefined;
}

function GetAllBalances(props: BalanceProps) {
  const checkout: Checkout = new Checkout();
  const { provider } = props;

  const [allBalances, setAllBalances] = useState<GetBalanceResult[]>();

  async function getAllBalances(checkout: Checkout) {
    if (!provider) {
      console.error('connect wallet before getting balance');
      return;
    }
    const address = await provider.getSigner().getAddress();

    const params: GetAllBalancesParams = {
      provider,
      walletAddress: address,
      chainId: ChainId.ETHEREUM,
    };

    try {
      const getAllBalancesResult = await checkout.getAllBalances(params);
      console.log('getAllBalanceResult', getAllBalancesResult);
      setAllBalances(getAllBalancesResult.balances);
    } catch (err: any) {
      console.error(err);
      console.log(err.name);
      console.log(err.message);
      console.log(err.stack);
      console.log(err.data);
    }
  }

  return (
    <div className="Connect">
      <h1 className="sample-heading">Get All Balances</h1>
      <div className="divider"></div>
      <button onClick={() => getAllBalances(checkout)}>
        Get All Balances (Ethereum)
      </button>
      {allBalances?.map((balance) => (
        <div key={balance.token.symbol}>
          {balance.token.symbol + ' ' + balance.formattedBalance}
        </div>
      ))}
    </div>
  );
}

export default GetAllBalances;
