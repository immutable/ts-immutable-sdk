import { Web3Provider } from '@ethersproject/providers';
import { BigNumber, Contract, utils } from 'ethers';
import { ERC20ABI, GetERC20BalanceResult } from './types';
import { CheckoutErrorType, withCheckoutError } from '../errors';

export const getBalance = async (
  provider: Web3Provider,
  walletAddress: string
): Promise<BigNumber> => {
  return await withCheckoutError<BigNumber>(async () => {
    return await provider.getBalance(walletAddress);
  }, { type: CheckoutErrorType.GET_BALANCE_ERROR });
};

export const getERC20Balance = async (
  provider: Web3Provider,
  contractAddress: string,
  walletAddress: string
): Promise<GetERC20BalanceResult> => {
  return await withCheckoutError<GetERC20BalanceResult>(async () => {
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
      name,
      symbol,
      formattedBalance,
      balance,
      decimals,
    };

  }, { type: CheckoutErrorType.GET_ERC20_BALANCE_ERROR });
};
