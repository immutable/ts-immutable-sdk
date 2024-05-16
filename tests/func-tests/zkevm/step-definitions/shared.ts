import { orderbook } from '@imtbl/sdk';
import { DefineStepFunction } from 'jest-cucumber';
import { Wallet } from 'ethers';
import {
  connectToTestERC1155Token,
  connectToTestERC721Token,
  fulfillListing, getTrades,
  waitForOrderToBeOfStatus,
} from '../utils/orderbook';
import { GAS_OVERRIDES } from '../utils/orderbook/gas';
import { actionAll } from '../utils/orderbook/actions';

const imxForApproval = 0.02 * 1e18;
const imxForFulfillment = 0.05 * 1e18;
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
  tokenId: string,
) => {
  and(/^the offerer account has (\d+) ERC721 token$/, async () => {
    const testToken = await connectToTestERC721Token(banker, contractAddress);
    const mintTx = await testToken.mint(offerer.address, tokenId, GAS_OVERRIDES);
    await mintTx.wait(1);
  });
};

export const andTheOffererAccountHasERC1155Tokens = (
  and: DefineStepFunction,
  banker: Wallet,
  offerer: Wallet,
  contractAddress: string,
  tokenId: string,
) => {
  and(/^the offerer account has (\d+) ERC1155 tokens$/, async (amount) => {
    const testToken = await connectToTestERC1155Token(banker, contractAddress);
    const mintTx = await testToken.safeMint(offerer.address, tokenId, amount, '0x', GAS_OVERRIDES);
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

export const whenICreateAListing = (
  when: DefineStepFunction,
  sdk: orderbook.Orderbook,
  offerer: Wallet,
  contractAddress: string,
  tokenId: string,
  setListingId: (listingId: string) => void,
) => {
  when(/^I create a listing to sell (\d+) (\w+) tokens?$/, async (amount, tokenType): Promise<void> => {
    let sellItem;
    if (tokenType === 'ERC721') {
      sellItem = {
        contractAddress,
        tokenId,
        type: 'ERC721',
      } as orderbook.ERC721Item;
    } else {
      sellItem = {
        contractAddress,
        tokenId,
        type: 'ERC1155',
        amount: amount.toString(),
      } as orderbook.ERC1155Item;
    }

    const listing = await sdk.prepareListing({
      makerAddress: offerer.address,
      buy: {
        amount: `${listingPrice}`,
        type: 'NATIVE',
      },
      sell: sellItem,
    });

    const signatures = await actionAll(listing.actions, offerer);
    const { result } = await sdk.createListing({
      orderComponents: listing.orderComponents,
      orderHash: listing.orderHash,
      orderSignature: signatures[0],
      makerFees: [],
    });

    setListingId(result.id);
  });
};

export const thenTheListingShouldBeOfStatus = (
  then: DefineStepFunction,
  sdk: orderbook.Orderbook,
  getListingId: () => string,
) => {
  then(/^the listing should be of status (.*)$/, async (status: string) => {
    const listingId = getListingId();
    await waitForOrderToBeOfStatus(sdk, listingId, status);
  });
};

export const whenIFulfillTheListingToBuy = (
  when: DefineStepFunction,
  sdk: orderbook.Orderbook,
  fulfiller: Wallet,
  getListingId: () => string,
) => {
  when(/^I fulfill the listing to buy (\d+) tokens?$/, async (amount) => {
    const listingId = getListingId();
    await fulfillListing(sdk, listingId, fulfiller, amount.toString());
  });
};

export const andERC721TokenShouldBeTransferredToTheFulfiller = (
  and: DefineStepFunction,
  banker: Wallet,
  contractAddress: string,
  tokenId: string,
  fulfiller: Wallet,
) => {
  and(/^(\d+) ERC721 token should be transferred to the fulfiller$/, async (amount) => {
    const testToken = await connectToTestERC721Token(banker, contractAddress);
    const fulfillerBalance = await testToken.balanceOf(fulfiller.address);
    expect(fulfillerBalance.toString()).toEqual(amount.toString());

    const owner = await testToken.ownerOf(tokenId);
    expect(owner).toEqual(fulfiller.address);
  });
};

export const andERC1155TokensShouldBeTransferredToTheFulfiller = (
  and: DefineStepFunction,
  banker: Wallet,
  contractAddress: string,
  tokenId: string,
  fulfiller: Wallet,
) => {
  and(/^(\d+) ERC1155 tokens should be transferred to the fulfiller$/, async (amount) => {
    const testToken = await connectToTestERC1155Token(banker, contractAddress);
    const fulfillerBalance = await testToken.balanceOf(fulfiller.address, tokenId);
    expect(fulfillerBalance.toString()).toEqual(amount.toString());
  });
};

export const andTradeShouldBeAvailable = (
  and: DefineStepFunction,
  sdk: orderbook.Orderbook,
  fulfiller: Wallet,
  getListingId: () => string,
) => {
  and(/^(\d+) trades? should be available$/, async (count) => {
    const listingId = getListingId();
    let attempt = 0;
    let targetTrades: orderbook.Trade[] | undefined;
    while (attempt < 5 && !targetTrades) {
      // eslint-disable-next-line no-await-in-loop
      targetTrades = await getTrades(sdk, listingId, fulfiller);
      if (targetTrades.length !== count) {
        // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 5_000));
      }

      attempt++;
    }

    expect(targetTrades?.length === count);
  });
};
