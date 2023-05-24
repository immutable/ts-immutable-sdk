import { Wallet } from 'ethers';
import { TestToken, TestToken__factory } from './test-token/index';

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
  );

  await testTokenContract.deployed();

  return {
    contract: testTokenContract,
  };
}
