import { Wallet } from 'ethers';
import hre from 'hardhat';
import { TestERC20Token, TestERC20Token__factory } from '../../typechain-types';
import { GAS_OVERRIDES } from './gas';

export async function connectToTestERC20Token(deployer: Wallet, tokenAddress: string): Promise<TestERC20Token> {
  const hreEthers = (hre as any).ethers;
  const testTokenContractFactory = await hreEthers.getContractFactory("TestERC20Token") as TestERC20Token__factory;
  return testTokenContractFactory.connect(deployer).attach(tokenAddress) as unknown as TestERC20Token
}

/**
 * Deploys the TestToken ERC20 contract to the hardhat network.
 *
 * @returns the TestToken contract
 */
export async function deployERC20Token(deployer: Wallet): Promise<void> {
  const hreEthers = (hre as any).ethers;
  const deployerAddress = await deployer.getAddress();

  const testTokenContractFactory = await hreEthers.getContractFactory("TestERC20Token") as TestERC20Token__factory;
  const testTokenContract = await testTokenContractFactory.connect(deployer).deploy(
    deployerAddress,
    'TestERC20',
    'TST',
    '100000000000000000000000000000',
    GAS_OVERRIDES
  );

  await testTokenContract.waitForDeployment();
  console.log(`Test ERC20 token contract deployed: ${await testTokenContract.getAddress()}`)

  const minterRoleTx = await testTokenContract.grantMinterRole(deployerAddress, GAS_OVERRIDES);
  await minterRoleTx.wait()

  console.log(`Minter role granted to ${deployerAddress}`)
}
