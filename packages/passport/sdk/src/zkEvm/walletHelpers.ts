import { BigNumber, BigNumberish, ethers } from 'ethers';
import { walletContracts } from '@0xsequence/abi';
import { decodeSignature, encodeSignature } from '@0xsequence/config';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Signer } from '@ethersproject/abstract-signer';
import { MetaTransaction, MetaTransactionNormalised, TypedDataPayload } from './types';

const SIGNATURE_WEIGHT = 1; // Weight of a single signature in the multi-sig
const TRANSACTION_SIGNATURE_THRESHOLD = 1; // Total required weight in the multi-sig for a transaction
const SIGNING_SIGNATURE_THRESHOLD = 2; // Total required weight in the multi-sig for data signing

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

export function getNormalisedTransactions(txs: MetaTransaction[]): MetaTransactionNormalised[] {
  return txs.map((t) => ({
    delegateCall: t.delegateCall === true,
    revertOnError: t.revertOnError === true,
    gasLimit: t.gasLimit ?? ethers.constants.Zero,
    target: t.to ?? ethers.constants.AddressZero,
    value: t.value ?? ethers.constants.Zero,
    data: t.data ?? [],
  }));
}

export function digestOfTransactionsAndNonce(nonce: BigNumberish, normalisedTransactions: MetaTransactionNormalised[]) {
  const packMetaTransactionsNonceData = ethers.utils.defaultAbiCoder.encode(
    ['uint256', META_TRANSACTIONS_TYPE],
    [nonce, normalisedTransactions],
  );
  return ethers.utils.keccak256(packMetaTransactionsNonceData);
}

export const getNonce = async (jsonRpcProvider: JsonRpcProvider, smartContractWalletAddress: string) => {
  const code = await jsonRpcProvider.send('eth_getCode', [smartContractWalletAddress, 'latest']);
  if (code && code !== '0x') {
    const contract = new ethers.Contract(
      smartContractWalletAddress,
      walletContracts.mainModule.abi,
      jsonRpcProvider,
    );
    return contract.nonce();
  }
  return 0;
};

const encodeMessageSubDigest = (chainId: BigNumber, walletAddress: string, digest: string): string => (
  ethers.utils.solidityPack(
    ['string', 'uint256', 'address', 'bytes32'],
    [ETH_SIGN_PREFIX, chainId, walletAddress, digest],
  )
);

export const getSignedMetaTransactions = async (
  metaTransactions: MetaTransaction[],
  nonce: BigNumberish,
  chainId: BigNumber,
  walletAddress: string,
  signer: Signer,
): Promise<string> => {
  const normalisedMetaTransactions = getNormalisedTransactions(metaTransactions);

  // Get the hash
  const digest = digestOfTransactionsAndNonce(nonce, normalisedMetaTransactions);
  const completePayload = encodeMessageSubDigest(chainId, walletAddress, digest);

  const hash = ethers.utils.keccak256(completePayload);

  // Sign the digest
  const hashArray = ethers.utils.arrayify(hash);
  const ethsigNoType = await signer.signMessage(hashArray);
  const signedDigest = `${ethsigNoType}${ETH_SIGN_FLAG}`;

  // Add metadata
  const encodedSignature = encodeSignature({
    threshold: TRANSACTION_SIGNATURE_THRESHOLD,
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
    normalisedMetaTransactions,
    nonce,
    encodedSignature,
  ]);
};

const decodeRelayerTypedDataSignature = (relayerSignature: string) => {
  const signatureWithThreshold = `0000${relayerSignature}`;
  return decodeSignature(signatureWithThreshold);
};

export const getSignedTypedData = async (
  typedData: TypedDataPayload,
  relayerSignature: string,
  chainId: BigNumber,
  walletAddress: string,
  signer: Signer,
): Promise<string> => {
  // Get the hash
  const types = { ...typedData.types };

  // remove EIP712Domain key from types as ethers will auto-gen it in
  // the hash encoder below
  // @ts-ignore
  delete types.EIP712Domain;

  // eslint-disable-next-line no-underscore-dangle
  const digest = ethers.utils._TypedDataEncoder.hash(typedData.domain, types, typedData.message);
  const completePayload = encodeMessageSubDigest(chainId, walletAddress, digest);

  const hash = ethers.utils.keccak256(completePayload);

  // Sign the digest
  const hashArray = ethers.utils.arrayify(hash);
  const ethsigNoType = await signer.signMessage(hashArray);
  const signedDigest = `${ethsigNoType}${ETH_SIGN_FLAG}`;

  const { signers } = decodeRelayerTypedDataSignature(relayerSignature);

  return encodeSignature({
    threshold: SIGNING_SIGNATURE_THRESHOLD,
    signers: [
      ...signers,
      {
        weight: SIGNATURE_WEIGHT,
        signature: signedDigest,
      },
    ],
  });
};

export const getEip155ChainId = (chainId: number) => `eip155:${chainId}`;
