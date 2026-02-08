import {
  keccak256,
  encodePacked,
  toBytes,
  hashTypedData,
  type Hex,
} from 'viem';
import { Address, Abi, AbiFunction, Provider } from 'ox';
import { TypedDataPayload } from '..';
import { SequenceSigner } from './signer';

const READ_NONCE = Abi.from(['function readNonce(uint256 _space) external view returns (uint256)'])[0];

const ETH_SIGN_PREFIX = '\x19\x01';

export const isWalletDeployed = async (
  rpcProvider: Provider.Provider,
  walletAddress: string,
): Promise<boolean> => {
  return (await rpcProvider.request({ method: 'eth_getCode', params: [Address.from(walletAddress), 'pending'] })) !== '0x'
};

export const encodeNonce = (nonceSpace: bigint, nonce: bigint): bigint => {
  const space = BigInt(nonceSpace.toString());
  const n = BigInt(nonce.toString());
  const shiftedSpace = space * (2n ** 96n);
  return n + shiftedSpace;
};

export const getNonce = async (
  rpcProvider: Provider.Provider,
  walletAddress: string,
  nonceSpace?: bigint,
): Promise<bigint> => {
  const rawSpace = nonceSpace ? (nonceSpace >> 96n) : 0n;

  const deployed = await isWalletDeployed(rpcProvider, walletAddress);
  if (!deployed) {
    return encodeNonce(rawSpace, 0n);
  }
  
  const callData = AbiFunction.encodeData(READ_NONCE, [rawSpace]);
  
  const result = await rpcProvider.request({
    method: 'eth_call',
    params: [
      {
        to: Address.from(walletAddress),
        data: callData,
      },
      'latest',
    ],
  });
  
  const nonce = AbiFunction.decodeResult(READ_NONCE, result);

  return encodeNonce(rawSpace, nonce);
};

export const getEip155ChainId = (chainId: number): string => `eip155:${chainId}`;

export const encodeMessageSubDigest = (chainId: bigint, walletAddress: string, digest: string): Hex => (
  encodePacked(
    ['string', 'uint256', 'address', 'bytes32'],
    [ETH_SIGN_PREFIX, chainId, walletAddress as `0x${string}`, digest as `0x${string}`],
  )
);

export const signAndPackTypedData = async (
  typedData: TypedDataPayload,
  chainId: bigint,
  walletAddress: string,
  signer: SequenceSigner,
): Promise<string> => {
  // Ethers auto-generates the EIP712Domain type, so remove it for hashing
  const types = { ...typedData.types };
  // @ts-ignore
  delete types.EIP712Domain;

  // Hash the EIP712 payload
  const typedDataHash = hashTypedData({
    domain: typedData.domain as Parameters<typeof hashTypedData>[0]['domain'],
    types: types,
    primaryType: typedData.primaryType,
    message: typedData.message,
  });

  const messageSubDigest = encodeMessageSubDigest(chainId, walletAddress, typedDataHash);
  const hash = keccak256(messageSubDigest);

  // Sign the sub-digest
  const hashArray = toBytes(hash);
  const signature = await signer.signMessage(hashArray);

  return signature;
};
