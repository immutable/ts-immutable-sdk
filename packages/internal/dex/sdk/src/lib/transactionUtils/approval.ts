import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { ERC20__factory } from 'contracts/types/factories/ERC20__factory';
import { ApprovalError } from 'errors';

/**
 * Get the amount of an ERC20 token that needs to be approved
 *
 * @param provider - The provider to use for the call
 * @param ownerAddress - The address of the owner of the token
 * @param tokenAmount  - The amount of the token to approve
 * @param spenderAddress - The address of the spender
 * @returns - The amount of the token that needs to be approved
 */
export const getERC20AmountToApprove = async (
  provider: JsonRpcProvider,
  ownerAddress: string,
  tokenAddress: string,
  tokenAmount: BigNumber,
  spenderAddress: string,
) => {
  // create an instance of the ERC20 token contract
  const erc20Contract = ERC20__factory.connect(tokenAddress, provider);

  // get the allowance for the token spender
  // minimum is 0 - no allowance
  let allowance: BigNumber;
  try {
    allowance = await erc20Contract.allowance(ownerAddress, spenderAddress);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown Error';
    throw new ApprovalError(`failed to get allowance: ${message}`);
  }

  // get the amount that needs to be approved
  const requiredAmount = BigNumber.from(tokenAmount).sub(allowance);
  if (requiredAmount.isNegative()) {
    return BigNumber.from('0');
  }

  return BigNumber.from(tokenAmount).sub(allowance);
};

/**
 * Get an unsigned ERC20 approve transaction
 *
 * @param ownerAddress - The address of the owner of the token
 * @param tokenAmount - The amount of the token to approve
 * @param spenderAddress - The address of the spender
 * @returns
 */
export const getUnsignedERC20ApproveTransaction = (
  ownerAddress: string,
  tokenAddress: string,
  tokenAmount: BigNumber,
  spenderAddress: string,
) => {
  if (ownerAddress === spenderAddress) {
    throw new ApprovalError('owner and spender addresses are the same');
  }

  const erc20Contract = ERC20__factory.createInterface();
  const callData = erc20Contract.encodeFunctionData('approve', [spenderAddress, tokenAmount]);

  return {
    data: callData,
    to: tokenAddress,
    value: 0,
    from: ownerAddress,
  };
};
