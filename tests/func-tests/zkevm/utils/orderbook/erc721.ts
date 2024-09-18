/* eslint-disable */
import { randomBytes } from 'crypto';
import { Wallet } from 'ethers';
import hre from 'hardhat';
import { OperatorAllowlistUpgradeable__factory, TestERC721Token, TestERC721Token__factory } from '../../typechain-types';
import { GAS_OVERRIDES } from './gas';

export function getRandomTokenId(): string {
  return BigInt('0x' + randomBytes(4).toString('hex')).toString(10);
}

export async function connectToTestERC721Token(deployer: Wallet, tokenAddress: string): Promise<TestERC721Token> {
  const hreEthers = (hre as any).ethers;
  const testTokenContractFactory = await hreEthers.getContractFactory("TestERC721Token") as TestERC721Token__factory;
  return testTokenContractFactory.connect(deployer).attach(tokenAddress) as unknown as TestERC721Token
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

  const testTokenContractFactory = await hreEthers.getContractFactory("TestERC721Token") as TestERC721Token__factory;
  const testTokenContract = await testTokenContractFactory.connect(deployer).deploy(
    deployerAddress,
    "TestERC721",
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
