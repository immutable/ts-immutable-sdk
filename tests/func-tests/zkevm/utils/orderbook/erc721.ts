/* eslint-disable */
import { Wallet } from 'ethers';
import { GAS_OVERRIDES } from './gas';
import { randomBytes } from 'crypto';
import hre from 'hardhat'
import { OperatorAllowlistUpgradeable__factory, TestToken, TestToken__factory } from '../../typechain-types';

export function getRandomTokenId(): string {
  return BigInt('0x' + randomBytes(4).toString('hex')).toString(10);
}

export async function connectToTestERC721Token(deployer: Wallet, tokenAddress: string): Promise<TestToken> {
  const hreEthers = (hre as any).ethers;
  const testTokenContractFactory = await hreEthers.getContractFactory("TestToken") as TestToken__factory;
  return testTokenContractFactory.connect(deployer).attach(tokenAddress) as unknown as TestToken
}

/**
 * Deploys the TestToken ERC721 contract to the hardhat network.
 *
 * @returns the TestToken contract
 */
export async function deployERC721Token(deployer: Wallet, seaportAddress: string, royaltyAddress?: string): Promise<void> {
  const hreEthers = (hre as any).ethers;
  const deployerAddress = await deployer.getAddress();

  const allowlistFactory = await hreEthers.getContractFactory("OperatorAllowlistUpgradeable") as OperatorAllowlistUpgradeable__factory;
  const allowlist = await allowlistFactory.connect(deployer).deploy(GAS_OVERRIDES);

  await allowlist.deployed();

  const initTx = await allowlist.initialize(deployerAddress, deployerAddress, deployerAddress, GAS_OVERRIDES);
  await initTx.wait(1);

  const tx = await allowlist.addAddressesToAllowlist([seaportAddress], GAS_OVERRIDES);
  await tx.wait(1);

  const testTokenContractFactory = await hreEthers.getContractFactory("TestToken") as TestToken__factory;
  const testTokenContract = await testTokenContractFactory.connect(deployer).deploy(
    deployerAddress,
    "Test",
    "TEST",
    "",
    "",
    allowlist.address,
    royaltyAddress || deployerAddress,
    100,
    GAS_OVERRIDES
  );

  await testTokenContract.deployed();
  console.log(`Test ERC721 token contract deployed: ${testTokenContract.address}`)

  const minterRoleTx = await testTokenContract.grantMinterRole(deployerAddress, GAS_OVERRIDES);
  await minterRoleTx.wait()

  console.log(`Minter role granted to ${deployerAddress}`)
}