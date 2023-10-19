import { JsonRpcProvider, TransactionRequest } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { ERC20__factory } from 'contracts/types/factories/ERC20__factory';
import { ApproveError, AlreadyApprovedError } from 'errors';
import { ethers } from 'ethers';
import { TradeType } from '@uniswap/sdk-core';
import { isERC20Amount, newAmount, toPublicAmount } from 'lib/utils';
import { CoinAmount, Coin, ERC20 } from 'types';
import {
  SecondaryFee, TransactionDetails,
} from '../../types';
import { calculateGasFee } from './gas';

type PreparedApproval = {
  spender: string;
  amount: CoinAmount<ERC20>;
};

/**
 * Get the amount of an ERC20 token that needs to be approved by
 * checking the existing allowance for the spender
 *
 * @param provider - The provider to use for the call
 * @param ownerAddress - The address of the owner of the token
 * @param tokenAmount  - The amount of the token to approve
 * @param spenderAddress - The address of the spender
 * @returns - The amount of the token that needs to be approved
 */
const getERC20AmountToApprove = async (
  provider: JsonRpcProvider,
  ownerAddress: string,
  tokenAmount: CoinAmount<ERC20>,
  spenderAddress: string,
): Promise<CoinAmount<ERC20>> => {
  // create an instance of the ERC20 token contract
  const erc20Contract = ERC20__factory.connect(tokenAmount.token.address, provider);

  // get the allowance for the token spender
  // minimum is 0 - no allowance
  let allowance: BigNumber;
  try {
    allowance = await erc20Contract.allowance(ownerAddress, spenderAddress);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown Error';
    throw new ApproveError(`failed to get allowance: ${message}`);
  }

  // get the amount that needs to be approved
  const requiredAmount = tokenAmount.value.sub(allowance);
  if (requiredAmount.isNegative() || requiredAmount.isZero()) {
    throw new AlreadyApprovedError(tokenAmount.toString(), tokenAmount.token.address, spenderAddress);
  }

  return newAmount(requiredAmount, tokenAmount.token);
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
  amountSpecified: CoinAmount<Coin>,
  amountWithSlippage: CoinAmount<Coin>,
  contracts: {
    routerAddress: string;
    secondaryFeeAddress: string;
  },
  secondaryFees: SecondaryFee[],
): PreparedApproval | null => {
  const amountInToApprove = tradeType === TradeType.EXACT_INPUT ? amountSpecified : amountWithSlippage;
  if (!isERC20Amount(amountInToApprove)) {
    return null;
  }

  const spender = secondaryFees.length === 0
    ? contracts.routerAddress
    : contracts.secondaryFeeAddress;

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
  let amountToApprove: CoinAmount<ERC20>;
  try {
    amountToApprove = await getERC20AmountToApprove(
      provider,
      ownerAddress,
      tokenAmount,
      spenderAddress,
    );
  } catch (e) {
    if (e instanceof AlreadyApprovedError) {
      // already approved for the required amount, nothing to do
      return null;
    }

    throw e;
  }

  return getUnsignedERC20ApproveTransaction(
    ownerAddress,
    amountToApprove,
    spenderAddress,
  );
};

export async function getApproveGasEstimate(
  provider: JsonRpcProvider,
  ownerAddress: string,
  spenderAddress: string,
  tokenAddress: string,
): Promise<ethers.BigNumber> {
  const erc20Contract = ERC20__factory.connect(tokenAddress, provider);
  return await erc20Contract.estimateGas.approve(spenderAddress, ethers.constants.MaxUint256, {
    from: ownerAddress,
  });
}

export const getApproval = async (
  provider: JsonRpcProvider,
  ownerAddress: string,
  preparedApproval: PreparedApproval,
  gasPrice: CoinAmount<Coin> | null,
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

  const gasFeeEstimate = gasPrice ? calculateGasFee(gasPrice, gasEstimate) : null;

  return {
    transaction: approveTransaction,
    gasFeeEstimate: gasFeeEstimate ? toPublicAmount(gasFeeEstimate) : null,
  };
};
