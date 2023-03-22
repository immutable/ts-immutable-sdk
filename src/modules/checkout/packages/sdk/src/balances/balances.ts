import { Web3Provider } from '@ethersproject/providers';
import { Contract, utils } from 'ethers';
import { ERC20ABI, GetBalanceResult } from '../types';
import { CheckoutErrorType, withCheckoutError } from '../errors';
import { getNetworkInfo } from '../connect';

export const getBalance = async (
  provider: Web3Provider,
  walletAddress: string,
  contractAddress?: string
): Promise<GetBalanceResult> => {
  if(!contractAddress || contractAddress === "") {
    return await withCheckoutError<GetBalanceResult>(async () => {
      const networkInfo = await getNetworkInfo(provider);
      const balance = await provider.getBalance(walletAddress);
      return {
        balance,
        formattedBalance: utils.formatUnits(balance, 18),
        token: networkInfo.nativeCurrency
      }
    }, { type: CheckoutErrorType.GET_BALANCE_ERROR });
  }

  return await withCheckoutError<GetBalanceResult>(async () => {
    const contract = new Contract(
      contractAddress,
      JSON.stringify(ERC20ABI),
      provider
    );
    const name = await contract.name();
    const symbol = await contract.symbol();
    const balance = await contract.balanceOf(walletAddress);
    const decimals = await contract.decimals();
    const formattedBalance = utils.formatUnits(balance, decimals);
    return {
      balance,
      formattedBalance,
      token: {
        name,
        symbol,
        decimals,
        address: contractAddress
      }
    } as GetBalanceResult;
  }, { type: CheckoutErrorType.GET_ERC20_BALANCE_ERROR });
};
