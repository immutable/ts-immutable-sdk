import {
  ExternalProvider, JsonRpcSigner, TransactionRequest, Web3Provider,
} from '@ethersproject/providers';
import { walletContracts } from '@0xsequence/abi';
import { encodeSignature } from '@0xsequence/config';

import { BigNumberish, ethers } from 'ethers';
import { PassportConfiguration } from '../../config';
import { ConfirmationScreen } from '../../confirmation';
import { RelayerAdapter } from '../relayerAdapter';
import { Transaction } from '../types';
import { digestOfTransactionsNonce, sequenceTxAbiEncode } from '../utils';

type EthSendTransactionInput = {
  transactionRequest: TransactionRequest,
  magicProvider: ExternalProvider,
  config: PassportConfiguration,
  confirmationScreen: ConfirmationScreen,
  relayerAdapter: RelayerAdapter,
};

const getNonce = async (magicWeb3Provider: Web3Provider, smartContractWalletAddress: string) => {
  const code = await magicWeb3Provider.getCode(smartContractWalletAddress);
  if (code) {
    const contract = new ethers.Contract(smartContractWalletAddress, walletContracts.mainModule.abi, magicWeb3Provider);
    return contract.nonce();
  }
  return 0;
};

export async function ethSign(signer: JsonRpcSigner, message: string | Uint8Array, hashed = false) {
  // TODO: Determine if message should be hashed, and remove hashed argument
  const hash = hashed ? message : ethers.utils.keccak256(message);
  const hashArray = ethers.utils.arrayify(hash);
  const ethsigNoType = await signer.signMessage(hashArray);
  return ethsigNoType.endsWith('03') || ethsigNoType.endsWith('02') ? ethsigNoType : `${ethsigNoType}02`;
}

const getSignedTransactions = async (transactions: Transaction[], nonce: BigNumberish, signer: JsonRpcSigner) => {
  // Get the digest
  const digest = digestOfTransactionsNonce(nonce, ...transactions);

  // Sign the digest
  const signature = await ethSign(signer, digest);

  // Add metadata
  const encodedSignature = encodeSignature(signature);

  // Encode the transaction;
  const walletInterface = new ethers.utils.Interface(walletContracts.mainModule.abi);
  return walletInterface.encodeFunctionData(walletInterface.getFunction('execute'), [
    sequenceTxAbiEncode(transactions),
    nonce,
    encodedSignature,
  ]);
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

  const signedTransaction = await getSignedTransactions([sequenceTransaction], nonce, signer);

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

  const signedTransactions = await getSignedTransactions([sequenceTransaction, sequenceFeeTransaction], nonce, signer);

  // TODO: ID-697 Evaluate transactions through Guardian

  const transactionHash = await relayerAdapter.ethSendTransaction({
    to: transactionRequest.to,
    data: signedTransactions,
  });

  const relayerTransaction = await relayerAdapter.imGetTransactionByHash(transactionHash);
  return relayerTransaction.hash;
};
