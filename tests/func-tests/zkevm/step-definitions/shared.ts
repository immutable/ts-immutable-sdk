import { DefineStepFunction } from 'jest-cucumber';
import { Wallet } from 'ethers';
import { connectToTestERC1155Token, connectToTestERC721Token } from '../utils/orderbook';
import { GAS_OVERRIDES } from '../utils/orderbook/gas';

const imxForApproval = 0.01 * 1e18;
const imxForFulfillment = 0.04 * 1e18;
const listingPrice = 0.0001 * 1e18;

export const givenIHaveAFundedOffererAccount = (
  given: DefineStepFunction,
  banker: Wallet,
  offerer: Wallet,
) => {
  given(/^I have a funded offerer account$/, async () => {
    const fundingTx = await banker.sendTransaction({
      to: offerer.address,
      value: `${imxForApproval}`,
      ...GAS_OVERRIDES,
    });

    await fundingTx.wait(1);
  });
};

export const andTheOffererAccountHasERC721Token = (
  and: DefineStepFunction,
  banker: Wallet,
  offerer: Wallet,
  contractAddress: string,
  testTokenId: string,
) => {
  and(/^the offerer account has (\d+) ERC721 token$/, async () => {
    const testToken = await connectToTestERC721Token(banker, contractAddress);
    const mintTx = await testToken.mint(offerer.address, testTokenId, GAS_OVERRIDES);
    await mintTx.wait(1);
  });
};

export const andTheOffererAccountHasERC1155Tokens = (
  and: DefineStepFunction,
  banker: Wallet,
  offerer: Wallet,
  contractAddress: string,
  testTokenId: string,
) => {
  and(/^the offerer account has (\d+) ERC1155 tokens$/, async (amount) => {
    const testToken = await connectToTestERC1155Token(banker, contractAddress);
    const mintTx = await testToken.safeMint(offerer.address, testTokenId, amount, '0x', GAS_OVERRIDES);
    await mintTx.wait(1);
  });
};

export const andIHaveAFundedFulfillerAccount = (
  and: DefineStepFunction,
  banker: Wallet,
  fulfiller: Wallet,
) => {
  and(/^I have a funded fulfiller account$/, async () => {
    const fundingTx = await banker.sendTransaction({
      to: fulfiller.address,
      value: `${(listingPrice + imxForFulfillment)}`,
      ...GAS_OVERRIDES,
    });

    await fundingTx.wait(1);
  });
};
