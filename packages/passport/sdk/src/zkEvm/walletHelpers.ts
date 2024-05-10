import { Zero, AddressZero } from '@ethersproject/constants';
import { arrayify } from '@ethersproject/bytes';
import { keccak256 } from '@ethersproject/keccak256';
import { ErrorCode } from '@ethersproject/logger';
import { defaultAbiCoder, Interface } from '@ethersproject/abi';
import { _TypedDataEncoder } from '@ethersproject/hash';
import { pack } from '@ethersproject/solidity';
import { Contract } from '@ethersproject/contracts';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { walletContracts } from '@0xsequence/abi';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { Signer } from '@ethersproject/abstract-signer';
import { v1 as sequenceCoreV1 } from '@0xsequence/core';
import { trackDuration } from '@imtbl/metrics';
import { MetaTransaction, MetaTransactionNormalised, TypedDataPayload } from './types';

const SIGNATURE_WEIGHT = 1; // Weight of a single signature in the multi-sig
const TRANSACTION_SIGNATURE_THRESHOLD = 1; // Total required weight in the multi-sig for a transaction
const EIP712_SIGNATURE_THRESHOLD = 2; // Total required weight in the multi-sig for data signing

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
    gasLimit: t.gasLimit ?? Zero,
    target: t.to ?? AddressZero,
    value: t.value ?? Zero,
    data: t.data ?? [],
  }));
}

export function digestOfTransactionsAndNonce(nonce: BigNumberish, normalisedTransactions: MetaTransactionNormalised[]) {
  const packMetaTransactionsNonceData = defaultAbiCoder.encode(
    ['uint256', META_TRANSACTIONS_TYPE],
    [nonce, normalisedTransactions],
  );
  return keccak256(packMetaTransactionsNonceData);
}

export const getNonce = async (
  rpcProvider: StaticJsonRpcProvider,
  smartContractWalletAddress: string,
): Promise<BigNumber> => {
  try {
    const contract = new Contract(
      smartContractWalletAddress,
      walletContracts.mainModule.abi,
      rpcProvider,
    );
    const result = await contract.nonce();
    if (result instanceof BigNumber) {
      return result;
    }
  } catch (error) {
    if (error instanceof Error
      && 'code' in error
      && error.code === ErrorCode.CALL_EXCEPTION) {
      // The most likely reason for a CALL_EXCEPTION is that the smart contract wallet
      // has not been deployed yet, so we should default to a nonce of 0.
      return BigNumber.from(0);
    }

    throw error;
  }

  throw new Error('Unexpected result from contract.nonce() call.');
};

const encodeMessageSubDigest = (chainId: BigNumber, walletAddress: string, digest: string): string => (
  pack(
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

  const hash = keccak256(completePayload);

  // Sign the digest
  const hashArray = arrayify(hash);

  const startTime = performance.now();
  const ethsigNoType = await signer.signMessage(hashArray);
  trackDuration(
    'passport',
    'magicSignMessageGetSignedMetaTransactions',
    Math.round(performance.now() - startTime),
  );

  const signedDigest = `${ethsigNoType}${ETH_SIGN_FLAG}`;

  // Add metadata
  const encodedSignature = sequenceCoreV1.signature.encodeSignature({
    version: 1,
    threshold: TRANSACTION_SIGNATURE_THRESHOLD,
    signers: [
      {
        isDynamic: false,
        unrecovered: true,
        weight: SIGNATURE_WEIGHT,
        signature: signedDigest,
      },
    ],
  });

  // Encode the transaction;
  const walletInterface = new Interface(walletContracts.mainModule.abi);
  return walletInterface.encodeFunctionData(walletInterface.getFunction('execute'), [
    normalisedMetaTransactions,
    nonce,
    encodedSignature,
  ]);
};

const decodeRelayerTypedDataSignature = (relayerSignature: string) => {
  const signatureWithThreshold = `0x0000${relayerSignature}`;
  return sequenceCoreV1.signature.decodeSignature(signatureWithThreshold);
};

export const getSignedTypedData = async (
  typedData: TypedDataPayload,
  relayerSignature: string,
  chainId: BigNumber,
  walletAddress: string,
  signer: Signer,
): Promise<string> => {
  // Ethers auto-generates the EIP712Domain type in the TypedDataEncoder, and so it needs to be removed
  const types = { ...typedData.types };
  // @ts-ignore
  delete types.EIP712Domain;

  // Hash the EIP712 payload and generate the complete payload
  // Implmented with reference to https://github.com/ethers-io/ethers.js/discussions/2738
  const typedDataHash = _TypedDataEncoder.hash(typedData.domain, types, typedData.message);
  const messageSubDigest = encodeMessageSubDigest(chainId, walletAddress, typedDataHash);
  const hash = keccak256(messageSubDigest);

  // Sign the sub digest
  // https://github.com/immutable/wallet-contracts/blob/7824b5f24b2e0eb2dc465ecb5cd71f3984556b73/src/contracts/modules/commons/ModuleAuth.sol#L155
  const hashArray = arrayify(hash);

  const startTime = performance.now();
  const ethsigNoType = await signer.signMessage(hashArray);
  trackDuration(
    'passport',
    'magicSignMessageTypedData',
    Math.round(performance.now() - startTime),
  );

  const signedDigest = `${ethsigNoType}${ETH_SIGN_FLAG}`;

  // Combine the relayer and user signatures; sort by address to match the imageHash order
  const { signers: relayerSigners } = decodeRelayerTypedDataSignature(relayerSignature);
  const combinedSigners = [
    ...relayerSigners,
    {
      isDynamic: false,
      unrecovered: true,
      weight: SIGNATURE_WEIGHT,
      signature: signedDigest,
      address: await signer.getAddress(),
    },
  ];
  const sortedSigners = combinedSigners.sort((a, b) => {
    const bigA = BigNumber.from(a.address);
    const bigB = BigNumber.from(b.address);

    if (bigA.lte(bigB)) {
      return -1;
    } if (bigA.eq(bigB)) {
      return 0;
    }
    return 1;
  });

  return sequenceCoreV1.signature.encodeSignature({
    version: 1,
    threshold: EIP712_SIGNATURE_THRESHOLD,
    signers: sortedSigners,
  });
};

export const getEip155ChainId = (chainId: number) => `eip155:${chainId}`;
