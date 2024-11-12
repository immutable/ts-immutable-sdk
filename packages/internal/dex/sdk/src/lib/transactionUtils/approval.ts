import { TradeType } from '@uniswap/sdk-core';
import { JsonRpcProvider, MaxUint256, TransactionRequest } from 'ethers';
import { ERC20__factory } from '../../contracts/types/factories/ERC20__factory';
import { ApproveError } from '../../errors';
import { isERC20Amount, toPublicAmount } from '../utils';
import { CoinAmount, Coin, ERC20, Native, SecondaryFee, TransactionDetails } from '../../types';
import { calculateGasFee } from './gas';

type PreparedApproval = {
  spender: string;
  amount: CoinAmount<ERC20>;
};

/**
 * Check if the spender needs approval for the token
 *
 * @param provider - The provider to use for the call
 * @param ownerAddress - The address of the owner of the token
 * @param tokenAmount  - The amount of the token to approve
 * @param spenderAddress - The address of the spender
 * @returns - The amount of the token that needs to be approved
 */
const doesSpenderNeedApproval = async (
  provider: JsonRpcProvider,
  ownerAddress: string,
  tokenAmount: CoinAmount<ERC20>,
  spenderAddress: string,
): Promise<boolean> => {
  // create an instance of the ERC20 token contract
  const erc20Contract = ERC20__factory.connect(tokenAmount.token.address, provider);

  // get the allowance for the token spender
  // the minimum allowance is 0 - no allowance
  let allowance: bigint;
  try {
    allowance = await erc20Contract.allowance(ownerAddress, spenderAddress);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown Error';
    throw new ApproveError(`failed to get allowance: ${message}`);
  }

  // check if approval is needed
  const requiredAmount = tokenAmount.value - allowance;
  if (requiredAmount <= 0) {
    return false;
  }

  return true;
};

/**
 * Get an unsigned ERC20 approve transaction
 *
 * @param ownerAddress - The address of the owner of the token
 * @param tokenAmount - The amount of the token to approve
 * @param spenderAddress - The address of the spender
 * @returns - The unsigned ERC20 approve transaction
 */
const getUnsignedERC20ApproveTransaction = (
  ownerAddress: string,
  tokenAmount: CoinAmount<ERC20>,
  spenderAddress: string,
): TransactionRequest => {
  if (ownerAddress === spenderAddress) {
    throw new ApproveError('owner and spender addresses are the same');
  }

  const erc20Contract = ERC20__factory.createInterface();
  const callData = erc20Contract.encodeFunctionData('approve', [spenderAddress, tokenAmount.value]);

  return {
    data: callData,
    to: tokenAmount.token.address,
    value: 0,
    from: ownerAddress,
  };
};

export const prepareApproval = (
  tradeType: TradeType,
  userSpecifiedAmount: CoinAmount<Coin>,
  quotedAmountWithSlippage: CoinAmount<Coin>,
  contracts: {
    routerAddress: string;
    secondaryFeeAddress: string;
  },
  secondaryFees: SecondaryFee[],
): PreparedApproval | null => {
  const amountInToApprove = tradeType === TradeType.EXACT_INPUT ? userSpecifiedAmount : quotedAmountWithSlippage;
  if (!isERC20Amount(amountInToApprove)) {
    return null;
  }

  const spender = secondaryFees.length === 0 ? contracts.routerAddress : contracts.secondaryFeeAddress;

  return { spender, amount: amountInToApprove };
};

/**
 * Get an unsigned approval transaction if needed
 *
 * @param provider The provider to use for the call
 * @param ownerAddress The address of the owner of the token
 * @param tokenAddress The address of the token to approve
 * @param tokenAmount The amount of the token to approve
 * @param spenderAddress The address of the spender
 * @returns The unsigned ERC20 approve transaction, or null if no approval is needed
 */
export const getApproveTransaction = async (
  provider: JsonRpcProvider,
  ownerAddress: string,
  tokenAmount: CoinAmount<ERC20>,
  spenderAddress: string,
): Promise<TransactionRequest | null> => {
  const needsApproval = await doesSpenderNeedApproval(provider, ownerAddress, tokenAmount, spenderAddress);

  // @dev approvals are not additive, so we need to approve the full amount
  return needsApproval ? getUnsignedERC20ApproveTransaction(ownerAddress, tokenAmount, spenderAddress) : null;
};

export async function getApproveGasEstimate(
  provider: JsonRpcProvider,
  ownerAddress: string,
  spenderAddress: string,
  tokenAddress: string,
): Promise<bigint> {
  const erc20Contract = ERC20__factory.connect(tokenAddress, provider);
  // @ts-expect-error Contract types arent matching the implementation
  return await erc20Contract.estimateGas.approve(spenderAddress, MaxUint256, {
    from: ownerAddress,
  });
}

export const getApproval = async (
  provider: JsonRpcProvider,
  ownerAddress: string,
  preparedApproval: PreparedApproval,
  gasPrice: CoinAmount<Native> | null,
): Promise<TransactionDetails | null> => {
  const approveTransaction = await getApproveTransaction(
    provider,
    ownerAddress,
    preparedApproval.amount,
    preparedApproval.spender,
  );

  if (!approveTransaction) {
    return null;
  }

  const gasEstimate = await getApproveGasEstimate(
    provider,
    ownerAddress,
    preparedApproval.spender,
    preparedApproval.amount.token.address,
  );

  const gasFeeEstimate = gasPrice ? calculateGasFee(false, gasPrice, gasEstimate) : null;

  return {
    transaction: approveTransaction,
    gasFeeEstimate: gasFeeEstimate ? toPublicAmount(gasFeeEstimate) : null,
  };
};
