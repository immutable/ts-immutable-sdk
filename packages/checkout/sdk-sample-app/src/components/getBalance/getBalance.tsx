import { Checkout, GetBalanceParams } from '@imtbl/checkout-sdk-web';
import { Web3Provider } from '@ethersproject/providers';
import { useState } from 'react';

interface BalanceProps {
  provider: Web3Provider | undefined;
}

function GetBalance(props: BalanceProps) {
  const checkout: Checkout = new Checkout();
  const { provider } = props;

  const [nativeBalance, setNative] = useState<string>();
  const [erc20Balance, setERC20] = useState<string>();

  async function getNativeBalanceClick(checkout: Checkout) {
    if (!provider) {
      console.error('connect wallet before getting balance');
      return;
    }
    const address = await provider.getSigner().getAddress();

    const params: GetBalanceParams = {
      provider,
      walletAddress: address,
    };

    try {
      const getBalanceRes = await checkout.getBalance(params);
      console.log('getBalanceRes', getBalanceRes);
      setNative(getBalanceRes.formattedBalance);
    } catch (err: any) {
      console.error(err);
      console.log(err.name);
      console.log(err.message);
      console.log(err.stack);
      console.log(err.data); //shd have data: { chainName: networkInfo.name }
    }
  }

  async function getERC20BalanceClick(checkout: Checkout) {
    if (!provider) {
      console.error('connect wallet before getting balance');
      return;
    }
    const address = await provider.getSigner().getAddress();

    const params: GetBalanceParams = {
      provider,
      walletAddress: address,
      contractAddress: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
    };

    try {
      const getBalanceRes = await checkout.getBalance(params);
      setERC20(getBalanceRes.formattedBalance);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="Connect">
      <h1 className="sample-heading">Get Balance</h1>
      <div className="divider"></div>
      <button onClick={() => getNativeBalanceClick(checkout)}>
        Get Balance (Native)
      </button>{' '}
      <span>native balance: {nativeBalance}</span>
      <br />
      <button onClick={() => getERC20BalanceClick(checkout)}>
        Get Balance (ERC20)
      </button>{' '}
      <span>erc20 balance: {erc20Balance}</span>
    </div>
  );
}

export default GetBalance;
