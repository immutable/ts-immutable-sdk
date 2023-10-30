import { Wallet } from 'ethers';
import { TestToken, TestToken__factory } from './test-token/index';
import { GAS_OVERRIDES } from './gas';

export interface TestTokenContract {
  contract: TestToken;
}

export async function deployTestToken(
  deployer: Wallet,
  royaltyAddress?: string,
): Promise<TestTokenContract> {
  const testTokenContractFactory = new TestToken__factory();
  const testTokenContract = await testTokenContractFactory.connect(deployer).deploy(
    deployer.address,
    'Test',
    'TEST',
    '',
    '',
    royaltyAddress || deployer.address,
    100,
    GAS_OVERRIDES,
  );

  await testTokenContract.deployed();

  return {
    contract: testTokenContract,
  };
}
