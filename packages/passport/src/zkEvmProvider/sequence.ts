import { BigNumber, BigNumberish, ethers } from 'ethers';
import { walletContracts } from '@0xsequence/abi';
import { encodeSignature } from '@0xsequence/config';
import { Web3Provider } from '@ethersproject/providers';
import { Signer } from '@ethersproject/abstract-signer';
import { Transaction, TransactionNormalised } from './types';

// These are ignored by the Relayer but for consistency we set them to the
// appropriate values for a 1/1 wallet.
//
// Weight of a single signature in the multisig
const SIGNATURE_WEIGHT = 1;
// Total required weight in the multisig
const SIGNATURE_THRESHOLD = 1;

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
  if (code && code !== '0x') {
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
  walletAddress: string,
  signer: Signer,
): Promise<string> => {
  const sequenceTransactions = getNormalisedTransactions(transactions);

  // Get the hash
  const digest = digestOfTransactionsAndNonce(nonce, sequenceTransactions);
  const completePayload = ethers.utils.solidityPack(
    ['string', 'uint256', 'address', 'bytes32'],
    [ETH_SIGN_PREFIX, chainId, walletAddress, digest],
  );

  const hash = ethers.utils.keccak256(completePayload);

  // Sign the digest
  const hashArray = ethers.utils.arrayify(hash);
  const ethsigNoType = await signer.signMessage(hashArray);
  const signedDigest = `${ethsigNoType}${ETH_SIGN_FLAG}`;

  // Add metadata
  const encodedSignature = encodeSignature({
    threshold: SIGNATURE_THRESHOLD,
    signers: [
      {
        weight: SIGNATURE_WEIGHT,
        signature: signedDigest,
      },
    ],
  });

  // Encode the transaction;
  const walletInterface = new ethers.utils.Interface(walletContracts.mainModule.abi);
  return walletInterface.encodeFunctionData(walletInterface.getFunction('execute'), [
    sequenceTransactions,
    nonce,
    encodedSignature,
  ]);
};
