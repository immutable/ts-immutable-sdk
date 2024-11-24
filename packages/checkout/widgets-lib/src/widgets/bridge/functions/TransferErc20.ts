import { Contract, Signer } from 'ethers';

export const getErc20Contract = (token: string, signer: Signer) => new Contract(
  token,
  ['function transfer(address to, uint amount)'],
  signer,
);
