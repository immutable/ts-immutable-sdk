/* eslint-disable @typescript-eslint/no-explicit-any */
import { Web3Provider } from '@ethersproject/providers';
import { BigNumber, Contract, utils } from 'ethers';
import { BalanceError } from './errors';
import { ERC20ABI, GetERC20BalanceResult } from './types';

export const getBalance = async (
  provider: Web3Provider,
  walletAddress: string
): Promise<BigNumber> => {
  try {
    return await provider.getBalance(walletAddress);
  } catch (err: any) {
    console.log(err.message);
    throw new BalanceError(
      `Error occurred while attempting to get the balance for ${walletAddress}`
    );
  }
};

export const getERC20Balance = async (
  provider: Web3Provider,
  contractAddress: string,
  walletAddress: string
): Promise<GetERC20BalanceResult> => {
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
    balance,
    formattedBalance,
    decimals,
  };
};
