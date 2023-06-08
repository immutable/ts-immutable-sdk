import {
  ExternalProvider, TransactionRequest, Web3Provider,
} from '@ethersproject/providers';

import { PassportConfiguration } from '../../config';
import { ConfirmationScreen } from '../../confirmation';
import { RelayerAdapter } from '../relayerAdapter';
import { getNonce, getSignedSequenceTransactions } from '../sequence';
import { Transaction } from '../types';

type EthSendTransactionInput = {
  transactionRequest: TransactionRequest,
  magicProvider: ExternalProvider,
  config: PassportConfiguration,
  confirmationScreen: ConfirmationScreen,
  relayerAdapter: RelayerAdapter,
};

export const ethSendTransaction = async ({
  transactionRequest,
  magicProvider,
  relayerAdapter,
}: EthSendTransactionInput): Promise<string> => {
  if (!transactionRequest.to) {
    throw new Error('eth_sendTransaction requires a "to" field');
  }
  if (!transactionRequest.data) {
    throw new Error('eth_sendTransaction requires a "data" field');
  }

  const smartContractWalletAddress = '0x123'; // TODO - this should be a claim in the JWT
  const magicWeb3Provider = new Web3Provider(magicProvider);
  const signer = magicWeb3Provider.getSigner();
  const nonce = await getNonce(magicWeb3Provider, smartContractWalletAddress);

  const sequenceTransaction: Transaction = {
    to: transactionRequest.to,
    data: transactionRequest.data,
    nonce,
    value: transactionRequest.value,
    revertOnError: true,
  };

  const signedTransaction = await getSignedSequenceTransactions([sequenceTransaction], nonce, signer);

  // TODO: Add support for non-native gas payments (e.g ERC20, feeTransaction initialisation must change)
  const feeOptions = await relayerAdapter.imGetFeeOptions(smartContractWalletAddress, signedTransaction);
  const imxFeeOption = feeOptions.find((feeOption) => feeOption.tokenSymbol === 'IMX');
  if (!imxFeeOption) {
    throw new Error('Failed to retrieve fees for IMX token');
  }

  const sequenceFeeTransaction: Transaction = {
    nonce,
    to: imxFeeOption.recipient,
    value: imxFeeOption.tokenPrice,
    revertOnError: true,
  };

  const signedTransactions = await getSignedSequenceTransactions(
    [sequenceTransaction, sequenceFeeTransaction],
    nonce,
    signer,
  );

  // TODO: ID-697 Evaluate transactions through Guardian

  const transactionHash = await relayerAdapter.ethSendTransaction(transactionRequest.to, signedTransactions);

  const relayerTransaction = await relayerAdapter.imGetTransactionByHash(transactionHash);
  return relayerTransaction.hash;
};
