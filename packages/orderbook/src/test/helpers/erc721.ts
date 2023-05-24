import { Wallet } from 'ethers';

// MEGA JANKY HACK
// Path directly to imx-engine. imx-engine and ts-immutable-sdk must be at the same level.
// Not CI friendly, but this suite (and associated compilation) is not run in CI
// eslint-disable-next-line
import { TestToken, TestToken__factory } from "../../../../../../imx-engine/services/order-book-mr/e2e/typechain-types";

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
