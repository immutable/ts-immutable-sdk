import { BigNumber, BigNumberish, ethers } from 'ethers';
import { walletContracts } from '@0xsequence/abi';
import { encodeSignature } from '@0xsequence/config';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { Transaction, TransactionNormalised } from './types';

const ETH_SIGN_FLAG = '02';
const ETH_SIGN_PREFIX = '\x19\x01';
const META_TRANSACTIONS_TYPE = `tuple(
  bool delegateCall,
  bool revertOnError,
  uint256 gasLimit,
  address target,
  uint256 value,
  bytes data
)[]`;

export function getNormalisedTransactions(txs: Transaction[]): TransactionNormalised[] {
  return txs.map((t) => ({
    delegateCall: t.delegateCall === true,
    revertOnError: t.revertOnError === true,
    gasLimit: t.gasLimit ?? ethers.constants.Zero,
    target: t.to ?? ethers.constants.AddressZero,
    value: t.value ?? ethers.constants.Zero,
    data: t.data ?? [],
  }));
}

export function digestOfTransactionsAndNonce(nonce: BigNumberish, sequenceTransactions: TransactionNormalised[]) {
  const packMetaTransactionsNonceData = ethers.utils.defaultAbiCoder.encode(
    ['uint256', META_TRANSACTIONS_TYPE],
    [nonce, sequenceTransactions],
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
  chainId: BigNumber,
  signer: JsonRpcSigner,
) => {
  const sequenceTransactions = getNormalisedTransactions(transactions);

  // Get the hash
  const digest = digestOfTransactionsAndNonce(nonce, sequenceTransactions);
  const completePayload = ethers.utils.solidityPack(
    ['string', 'uint256', 'address', 'bytes32'],
    [ETH_SIGN_PREFIX, chainId, await signer.getAddress(), digest],
  );
  const hash = ethers.utils.keccak256(completePayload);

  // Sign the digest
  const hashArray = ethers.utils.arrayify(hash);
  const ethsigNoType = await signer.signMessage(hashArray);
  const signedDigest = `${ethsigNoType}${ETH_SIGN_FLAG}`;

  // Add metadata
  const encodedSignature = encodeSignature(signedDigest);

  // Encode the transaction;
  const walletInterface = new ethers.utils.Interface(walletContracts.mainModule.abi);
  return walletInterface.encodeFunctionData(walletInterface.getFunction('execute'), [
    sequenceTransactions,
    nonce,
    encodedSignature,
  ]);
};
