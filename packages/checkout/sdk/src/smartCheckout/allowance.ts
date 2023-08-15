import { Web3Provider } from '@ethersproject/providers';
import { BigNumber, Contract } from 'ethers';
import { ERC20ABI } from '../types';
import { CheckoutError, CheckoutErrorType } from '../errors';

export const erc20Allowance = async (
  provider: Web3Provider,
  contractAddress: string,
  spenderAddress: string,
): Promise<BigNumber> => {
  try {
    const owner = await provider.getSigner().getAddress();
    const contract = new Contract(
      contractAddress,
      JSON.stringify(ERC20ABI),
      provider,
    );
    return await contract.allowance(owner, spenderAddress);
  } catch (err: any) {
    throw new CheckoutError(
      'Failed to get the allowance for ERC20',
      CheckoutErrorType.GET_ERC20_ALLOWANCE_ERROR,
      { contractAddress },
    );
  }
};
