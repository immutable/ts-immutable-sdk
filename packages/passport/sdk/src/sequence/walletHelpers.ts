import { Address, Abi, AbiFunction, Provider } from 'ox';
import { BigNumberish } from 'ethers';

const READ_NONCE = Abi.from(['function readNonce(uint256 _space) external view returns (uint256)'])[0]

export const isWalletDeployed = async (
  rpcProvider: Provider.Provider,
  walletAddress: string,
): Promise<boolean> => {
  return (await rpcProvider.request({ method: 'eth_getCode', params: [Address.from(walletAddress), 'pending'] })) !== '0x'
};

export const encodeNonce = (nonceSpace: BigNumberish, nonce: BigNumberish): bigint => {
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
