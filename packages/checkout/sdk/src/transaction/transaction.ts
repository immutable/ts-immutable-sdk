import { BigNumber, ethers } from 'ethers';
import { TransactionRequest, TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { hexValue } from 'ethers/lib/utils';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { ChainId, SendTransactionResult } from '../types';
import { IMMUTABLE_ZKVEM_GAS_OVERRIDES } from '../env';
import { isZkEvmChainId } from '../utils/utils';

export const setTransactionGasLimits = async (
  web3Provider: Web3Provider,
  transaction: TransactionRequest,
): Promise<TransactionRequest> => {
  const rawTx = transaction;

  const { chainId } = await web3Provider.getNetwork();
  if (!isZkEvmChainId(chainId)) return rawTx;

  // console.log(IMMUTABLE_ZKVEM_GAS_OVERRIDES.maxFeePerGas);
  // // eslint-disable-next-line no-underscore-dangle
  // console.log(IMMUTABLE_ZKVEM_GAS_OVERRIDES.maxFeePerGas._hex);
  // console.log(IMMUTABLE_ZKVEM_GAS_OVERRIDES.maxFeePerGas.toBigInt());
  // console.log(IMMUTABLE_ZKVEM_GAS_OVERRIDES.maxFeePerGas.toString());
  // console.log(IMMUTABLE_ZKVEM_GAS_OVERRIDES.maxFeePerGas.toJSON());
  // console.log(IMMUTABLE_ZKVEM_GAS_OVERRIDES.maxFeePerGas.toNumber());
  let maxFeePerGasHex = IMMUTABLE_ZKVEM_GAS_OVERRIDES.maxFeePerGas.toHexString();
  const splitValues = maxFeePerGasHex.split('x');
  if (splitValues[1].startsWith('0')) {
    maxFeePerGasHex = `0x${splitValues[1].replace('0', '')}`;
  }

  let maxPriorityFeePerGasHex = IMMUTABLE_ZKVEM_GAS_OVERRIDES.maxPriorityFeePerGas.toHexString();
  const splitValues2 = maxPriorityFeePerGasHex.split('x');
  if (splitValues2[1].startsWith('0')) {
    maxPriorityFeePerGasHex = `0x${splitValues2[1].replace('0', '')}`;
  }

  rawTx.maxFeePerGas = maxFeePerGasHex;
  rawTx.maxPriorityFeePerGas = maxPriorityFeePerGasHex;

  return rawTx;
};

export const sendTransaction = async (
  web3Provider: Web3Provider,
  transaction: TransactionRequest,
): Promise<SendTransactionResult> => {
  try {
    console.log(transaction);
    const signer = web3Provider.getSigner();
    const address = await signer.getAddress();
    console.log(address.toLowerCase());
    // try {
    //   const nonce = await signer.getTransactionCount();
    //   console.log('nonce', nonce);
    // } catch (err) {
    //   console.log('error fetching transaxction count');
    //   console.log(err);
    // }
    const rawTx = await setTransactionGasLimits(web3Provider, transaction);
    // rawTx.from = address;
    // rawTx.nonce = 1;
    // rawTx.value = BigNumber.from('1000000000000000000');
    rawTx.gasLimit = 200000;

    // try {
    //   const gasEstimate = await signer.estimateGas(rawTx);
    //   console.log('gasEstimate', gasEstimate.toString());
    //   rawTx.gasLimit = gasEstimate;
    // } catch (err) {
    //   console.log('error estimating gas... setting manually to 200,000');
    //   rawTx.gasLimit = BigNumber.from(200000);
    //   console.log(err);
    // }

    console.log(rawTx);
    console.log(JSON.stringify(rawTx));
    let transactionResponse: TransactionResponse = {} as TransactionResponse;
    // try {
    // eslint-disable-next-line max-len
    transactionResponse = await web3Provider.provider.request({ method: 'eth_sendTransaction', params: [{ ...rawTx, value: '0x0', chainId: '0x34A1' }] });
    // signer2.sendTransaction(rawTx);
    //   console.log(transactionResponse);
    // } catch (err) {
    //   console.log(err);
    // }

    // const transactionResponse = {} as TransactionResponse;
    return {
      transactionResponse,
    };
  } catch (err: any) {
    console.log('checkout.sendTransaction failed');
    console.log(err);
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
