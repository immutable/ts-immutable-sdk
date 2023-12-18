import {Wallet} from 'ethers';
import {ethers} from 'hardhat';
import {defaultGasOverrides} from "./utils";

export interface IOperatorAllowlist {
  address: string;
}

export const deployOperatorAllowlist = async (
  deployer: Wallet,
): Promise<IOperatorAllowlist> => {
  const contractFactory = await ethers.getContractFactory(
    'MyOperatorAllowlist',
  );

  const contract = await contractFactory.connect(deployer).deploy(
    deployer.address,  // owner
    defaultGasOverrides
  );

  await contract.deployed();

  return {
    address: contract.address,
  };
};
