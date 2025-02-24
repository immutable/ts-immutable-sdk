/* eslint-disable */
import { Wallet } from 'ethers';
import hre from 'hardhat';
import {
  TestERC1155Token, TestERC1155Token__factory
} from '../../typechain-types';
import { GAS_OVERRIDES } from './gas';

export async function connectToTestERC1155Token(deployer: Wallet, tokenAddress: string): Promise<TestERC1155Token> {
  const hreEthers = (hre as any).ethers;
  const testTokenContractFactory = await hreEthers.getContractFactory("TestERC1155Token") as TestERC1155Token__factory;
  return testTokenContractFactory.connect(deployer).attach(tokenAddress) as unknown as TestERC1155Token
}

/**
 * Deploys the TestToken ERC1155 contract to the hardhat network.
 *
 * @returns the TestToken contract
 */
export async function deployERC1155Token(deployer: Wallet, allowlistAddress: string, royaltyAddress?: string): Promise<void> {
  const hreEthers = (hre as any).ethers;
  const deployerAddress = await deployer.getAddress();

  const testTokenContractFactory = await hreEthers.getContractFactory("TestERC1155Token") as TestERC1155Token__factory;
  const testTokenContract = await testTokenContractFactory.connect(deployer).deploy(
      deployerAddress,
      "TestERC1155",
      "",
      "",
      allowlistAddress,
      royaltyAddress || deployerAddress,
      100,
      GAS_OVERRIDES
  );

  await testTokenContract.waitForDeployment();
  console.log(`Test ERC1155 token contract deployed: ${await testTokenContract.getAddress()}`)

  const minterRoleTx = await testTokenContract.grantMinterRole(deployerAddress, GAS_OVERRIDES);
  await minterRoleTx.wait()

  console.log(`Minter role granted to ${deployerAddress}`)
}
