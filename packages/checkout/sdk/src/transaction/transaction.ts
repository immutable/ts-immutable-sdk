import { ErrorCode, TransactionRequest } from 'ethers';
import { CheckoutError, CheckoutErrorType } from '../errors';
import {
  NamedBrowserProvider, SendTransactionResult,
} from '../types';
import { IMMUTABLE_ZKVEM_GAS_OVERRIDES } from '../env';
import { isZkEvmChainId } from '../utils/utils';

export function isPassportProvider(provider?: NamedBrowserProvider | null) {
  return provider?.ethereumProvider?.isPassport === true;
}

/**
 * Checks conditions to operate a gas-free flow.
 *
 * TODO:
 * - Phase 1 (2024): Allow all passport wallets to be gas-free.
 * - Phase 2 & 3 (2025): Not all passport wallets will be gas-free.
 *   Therefore, the gas-free condition must be checked against the relayer's
 *   `im_getFeeOptions` endpoint, which should return zero for
 *   passport accounts with gas sponsorship enabled.
 *
 * Refer to the docs for more details:
 * https://docs.immutable.com/docs/zkevm/architecture/gas-sponsorship-for-gamers/
 */
export function isGasFree(provider?: NamedBrowserProvider | null) {
  return isPassportProvider(provider);
}

export const setTransactionGasLimits = async (
  browserProvider: NamedBrowserProvider,
  transaction: TransactionRequest,
): Promise<TransactionRequest> => {
  const rawTx = transaction;

  const { chainId } = await browserProvider.getNetwork();

  if (!isZkEvmChainId(Number(chainId))) return rawTx;
  if (typeof rawTx.gasPrice !== 'undefined') return rawTx;
  if (isGasFree(browserProvider)) {
    rawTx.gasPrice = BigInt(0);
  } else {
    rawTx.maxFeePerGas = IMMUTABLE_ZKVEM_GAS_OVERRIDES.maxFeePerGas;
    rawTx.maxPriorityFeePerGas = IMMUTABLE_ZKVEM_GAS_OVERRIDES.maxPriorityFeePerGas;
  }
  return rawTx;
};

export const handleProviderError = (err: any) => {
  if (err.code === 'INSUFFICIENT_FUNDS' satisfies ErrorCode) {
    return new CheckoutError(
      err.message,
      CheckoutErrorType.INSUFFICIENT_FUNDS,
      { error: err },
    );
  }
  if (err.code === 'ACTION_REJECTED' satisfies ErrorCode) {
    return new CheckoutError(
      err.message,
      CheckoutErrorType.USER_REJECTED_REQUEST_ERROR,
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
  browserProvider: NamedBrowserProvider,
  transaction: TransactionRequest,
): Promise<SendTransactionResult> => {
  try {
    const signer = await browserProvider.getSigner();

    const rawTx = await setTransactionGasLimits(browserProvider, transaction);
    const transactionResponse = await signer.sendTransaction(rawTx);

    return {
      transactionResponse,
    };
  } catch (err: any) {
    throw handleProviderError(err);
  }
};
