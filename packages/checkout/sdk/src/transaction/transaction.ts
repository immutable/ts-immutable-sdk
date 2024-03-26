import { ethers } from 'ethers';
import { TransactionRequest, Web3Provider } from '@ethersproject/providers';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { SendTransactionResult } from '../types';
import { IMMUTABLE_ZKVEM_GAS_OVERRIDES } from '../env';
import { isZkEvmChainId } from '../utils/utils';

export const setTransactionGasLimits = async (
  web3Provider: Web3Provider,
  transaction: TransactionRequest,
): Promise<TransactionRequest> => {
  const rawTx = transaction;

  const { chainId } = await web3Provider.getNetwork();
  if (!isZkEvmChainId(chainId)) return rawTx;

  rawTx.maxFeePerGas = IMMUTABLE_ZKVEM_GAS_OVERRIDES.maxFeePerGas;
  rawTx.maxPriorityFeePerGas = IMMUTABLE_ZKVEM_GAS_OVERRIDES.maxPriorityFeePerGas;

  return rawTx;
};

export const sendTransaction = async (
  web3Provider: Web3Provider,
  transaction: TransactionRequest,
): Promise<SendTransactionResult> => {
  try {
    const signer = web3Provider.getSigner();

    const rawTx = await setTransactionGasLimits(web3Provider, transaction);
    const transactionResponse = await signer.sendTransaction(rawTx);

    return {
      transactionResponse,
    };
  } catch (err: any) {
    if (err.code === ethers.errors.INSUFFICIENT_FUNDS) {
      throw new CheckoutError(
        err.message,
        CheckoutErrorType.INSUFFICIENT_FUNDS,
        { error: err },
      );
    }
    if (err.code === ethers.errors.ACTION_REJECTED) {
      throw new CheckoutError(
        err.message,
        CheckoutErrorType.USER_REJECTED_REQUEST_ERROR,
        { error: err },
      );
    }
    if (err.code === ethers.errors.UNPREDICTABLE_GAS_LIMIT) {
      throw new CheckoutError(
        err.message,
        CheckoutErrorType.UNPREDICTABLE_GAS_LIMIT,
        { error: err },
      );
    }
    throw new CheckoutError(
      err.message,
      CheckoutErrorType.TRANSACTION_FAILED,
      { error: err },
    );
  }
};
