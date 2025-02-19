import {
  Contract, InterfaceAbi, Provider, Signer,
} from 'ethers';

export function getTokenContract(
  address: string,
  contractInterface: InterfaceAbi,
  signerOrProvider: Provider | Signer | undefined,
) {
  return new Contract(address, contractInterface, signerOrProvider);
}
