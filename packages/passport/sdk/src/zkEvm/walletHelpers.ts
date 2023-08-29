import { BigNumber, BigNumberish, ethers } from 'ethers';
import { walletContracts } from '@0xsequence/abi';
import * as wallet from '@0xsequence/wallet';
import { decodeSignature, encodeSignature } from '@0xsequence/config';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Signer } from '@ethersproject/abstract-signer';
import { sequenceContext } from '@0xsequence/network';
import { MetaTransaction, MetaTransactionNormalised, TypedDataPayload } from './types';

// These are ignored by the Relayer but for consistency we set them to the
// appropriate values for a 1/1 wallet.
//
// Weight of a single signature in the multisig
const SIGNATURE_WEIGHT = 1;
// Total required weight in the multisig
const TRANSACTION_SIGNATURE_THRESHOLD = 1;

// Total required weight in the multisig
const SIGNING_SIGNATURE_THRESHOLD = 2;

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

const compareAddr = ( // TODO: Add tests to ensure that functionality has not changed
  addrA: string,
  addrB: string,
) => {
  const bigA = BigNumber.from(addrA);
  const bigB = BigNumber.from(addrB);

  if (bigA < bigB) {
    return -1;
  } if (bigA === bigB) {
    return 0;
  }
  return 1;
};

// packAggregateSignature is a helper function that packs the users signature
// and relayer signature to form the valid 2-of-2 signature.
// It sorts by the address of the user and Immutable signer to match the imageHash order.
export function packAggregateSignature(accounts: {
  signature: string;
  account: string;
}[]) {
  const sorted = accounts.sort((a, b) => compareAddr(a.account, b.account));
  const signatures = [sorted[0].signature, sorted[1].signature];
  return ethers.utils.solidityPack(
    ['uint16', ...Array(accounts.length).fill('bytes')],
    [2, ...signatures],
  );
}

const decodeRelayerTypedDataSignature = (relayerSignature: string) => {
  const signatureWithThreshold = `0000${relayerSignature}`;
  return decodeSignature(signatureWithThreshold);
};

export const isValidSignature = async (
  jsonRpcProvider: JsonRpcProvider,
  smartContractWalletAddress: string,
  typedData: TypedDataPayload,
  signature: string,
) => {
  const types = { ...typedData.types };

  // remove EIP712Domain key from types as ethers will auto-gen it in
  // the hash encoder below
  // @ts-ignore
  delete types.EIP712Domain;

  // eslint-disable-next-line no-underscore-dangle
  const hash = ethers.utils._TypedDataEncoder.hash(typedData.domain, types, typedData.message);

  const contract = new ethers.Contract(
    smartContractWalletAddress,
    walletContracts.erc1271.abi,
    jsonRpcProvider,
  );

  return contract.isValidSignature(hash, signature) === walletContracts.erc1271.returns.isValidSignatureBytes32;
};

export const isValidSignatureSequence = async (
  jsonRpcProvider: JsonRpcProvider,
  smartContractWalletAddress: string,
  typedData: TypedDataPayload,
  signature: string,
) => {
  const types = { ...typedData.types };

  // remove EIP712Domain key from types as ethers will auto-gen it in
  // the hash encoder below
  // @ts-ignore
  delete types.EIP712Domain;

  // eslint-disable-next-line no-underscore-dangle
  const hash = ethers.utils._TypedDataEncoder.hash(typedData.domain, types, typedData.message);
  const digest = ethers.utils.arrayify(hash);

  const isValidEIP712Signature = wallet.isValidEIP712Signature(smartContractWalletAddress, digest, signature);
  console.log('isValidEIP712Signature', isValidEIP712Signature);

  const isValidEthSignSignature = wallet.isValidEthSignSignature(smartContractWalletAddress, digest, signature);
  console.log('isValidEthSignSignature', isValidEthSignSignature);

  const isValidContractWalletSignature = await wallet.isValidContractWalletSignature(smartContractWalletAddress, digest, signature, jsonRpcProvider);
  console.log('isValidContractWalletSignature', isValidContractWalletSignature);

  const isValidSequenceUndeployedWalletSignature = await wallet.isValidSequenceUndeployedWalletSignature(smartContractWalletAddress, digest, signature, sequenceContext, jsonRpcProvider);
  console.log('isValidSequenceUndeployedWalletSignature', isValidSequenceUndeployedWalletSignature);

  return wallet.isValidSignature(
    smartContractWalletAddress,
    digest,
    signature,
    jsonRpcProvider,
  );
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
