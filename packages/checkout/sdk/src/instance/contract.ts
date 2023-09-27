import { Provider } from '@ethersproject/providers';
import { Contract, ContractInterface, Signer } from 'ethers';

export function getTokenContract(
  address: string,
  contractInterface: ContractInterface,
  signerOrProvider: Provider | Signer | undefined,
) {
  return new Contract(address, contractInterface, signerOrProvider);
}
