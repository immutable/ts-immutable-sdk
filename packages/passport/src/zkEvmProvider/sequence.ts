import { BigNumberish, ethers } from 'ethers';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { walletContracts } from '@0xsequence/abi';
import { encodeSignature } from '@0xsequence/config';
import { Transaction, TransactionEncoded } from './types';

const META_TRANSACTIONS_TYPE = `tuple(
  bool delegateCall,
  bool revertOnError,
  uint256 gasLimit,
  address target,
  uint256 value,
  bytes data
)[]`;

export function sequenceTxAbiEncode(txs: Transaction[]): TransactionEncoded[] {
  return txs.map((t) => ({
    delegateCall: t.delegateCall === true,
    revertOnError: t.revertOnError === true,
    gasLimit: t.gasLimit !== undefined ? t.gasLimit : ethers.constants.Zero,
    target: t.to ?? ethers.constants.AddressZero,
    value: t.value !== undefined ? t.value : ethers.constants.Zero,
    data: t.data !== undefined ? t.data : [],
  }));
}

export function digestOfTransactionsNonce(nonce: BigNumberish, ...txs: Transaction[]) {
  const packMetaTransactionsNonceData = ethers.utils.defaultAbiCoder.encode(
    ['uint256', META_TRANSACTIONS_TYPE],
    [nonce, sequenceTxAbiEncode(txs)],
  );
  return ethers.utils.keccak256(packMetaTransactionsNonceData);
}

export const getNonce = async (magicWeb3Provider: Web3Provider, smartContractWalletAddress: string) => {
  const code = await magicWeb3Provider.getCode(smartContractWalletAddress);
  if (code) {
    const contract = new ethers.Contract(
      smartContractWalletAddress,
      walletContracts.mainModule.abi,
      magicWeb3Provider,
    );
    return contract.nonce();
  }
  return 0;
};

export const getSignedSequenceTransactions = async (
  transactions: Transaction[],
  nonce: BigNumberish,
  signer: JsonRpcSigner,
) => {
  // Get the digest
  const digest = digestOfTransactionsNonce(nonce, ...transactions);

  // Sign the digest
  const hashArray = ethers.utils.arrayify(digest);
  const ethsigNoType = await signer.signMessage(hashArray);
  const signedDigest = ethsigNoType.endsWith('03') || ethsigNoType.endsWith('02') ? ethsigNoType : `${ethsigNoType}02`;

  // Add metadata
  const encodedSignature = encodeSignature(signedDigest);

  // Encode the transaction;
  const walletInterface = new ethers.utils.Interface(walletContracts.mainModule.abi);
  return walletInterface.encodeFunctionData(walletInterface.getFunction('execute'), [
    sequenceTxAbiEncode(transactions),
    nonce,
    encodedSignature,
  ]);
};
