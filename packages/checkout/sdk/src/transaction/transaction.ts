import { BigNumber, ethers } from 'ethers';
import { TransactionRequest, Web3Provider } from '@ethersproject/providers';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { SendTransactionResult } from '../types';
import { IMMUTABLE_ZKVEM_GAS_OVERRIDES } from '../env';
import { isZkEvmChainId } from '../utils/utils';

export function isPassportProvider(provider?: Web3Provider | null) {
  return (provider?.provider as any)?.isPassport === true;
}

export function isGasFree(provider?: Web3Provider | null) {
  return isPassportProvider(provider);
}

export const setTransactionGasLimits = async (
  web3Provider: Web3Provider,
  transaction: TransactionRequest,
): Promise<TransactionRequest> => {
  const rawTx = transaction;

  const { chainId } = await web3Provider.getNetwork();
  if (!isZkEvmChainId(chainId)) return rawTx;
  if (typeof rawTx.gasPrice !== 'undefined') return rawTx;
  if (isGasFree(web3Provider)) {
    rawTx.gasPrice = BigNumber.from(0);
  } else {
    rawTx.maxFeePerGas = IMMUTABLE_ZKVEM_GAS_OVERRIDES.maxFeePerGas;
    rawTx.maxPriorityFeePerGas = IMMUTABLE_ZKVEM_GAS_OVERRIDES.maxPriorityFeePerGas;
  }
  return rawTx;
};

export const handleProviderError = (err: any) => {
  if (err.code === ethers.errors.INSUFFICIENT_FUNDS) {
    return new CheckoutError(
      err.message,
      CheckoutErrorType.INSUFFICIENT_FUNDS,
      { error: err },
    );
  }
  if (err.code === ethers.errors.ACTION_REJECTED) {
    return new CheckoutError(
      err.message,
      CheckoutErrorType.USER_REJECTED_REQUEST_ERROR,
      { error: err },
    );
  }
  if (err.code === ethers.errors.UNPREDICTABLE_GAS_LIMIT) {
    return new CheckoutError(
      err.message,
      CheckoutErrorType.UNPREDICTABLE_GAS_LIMIT,
      { error: err },
    );
  }
  return new CheckoutError(
    err.message,
    CheckoutErrorType.TRANSACTION_FAILED,
    { error: err },
  );
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
    throw handleProviderError(err);
  }
};
