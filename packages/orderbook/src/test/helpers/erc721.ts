import { Wallet } from 'ethers';
import { GAS_OVERRIDES } from './gas';
import { TestERC721Token, TestERC721Token__factory } from './test-token';

export interface TestTokenContract {
  contract: TestERC721Token;
}

export async function deployTestToken(
  deployer: Wallet,
  royaltyAddress?: string,
): Promise<TestTokenContract> {
  const testTokenContractFactory = new TestERC721Token__factory();
  const allowlistAddress = process.env.OPERATOR_ALLOWLIST_ADDRESS;

  if (!allowlistAddress) {
    throw new Error('OPERATOR_ALLOWLIST_ADDRESS is not set in the environment');
  }

  const testTokenContract = await testTokenContractFactory.connect(deployer).deploy(
    deployer.address,
    'Test',
    'TEST',
    '',
    '',
    allowlistAddress,
    royaltyAddress || deployer.address,
    100,
    GAS_OVERRIDES,
  );

  await testTokenContract.waitForDeployment();

  return {
    contract: testTokenContract,
  };
}
