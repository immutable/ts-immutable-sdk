import { orderbook } from '@imtbl/sdk';
import { DefineStepFunction } from 'jest-cucumber';
import { Wallet } from 'ethers';
import {
  bulkFulfillListings,
  connectToTestERC1155Token,
  connectToTestERC721Token,
  fulfillListing, getTrades,
  waitForOrderToBeOfStatus,
} from '../utils/orderbook';
import { GAS_OVERRIDES } from '../utils/orderbook/gas';
import { actionAll } from '../utils/orderbook/actions';

const imxForApproval = 0.03 * 1e18;
const imxForFulfillment = 0.08 * 1e18;
const listingPrice = 0.0001 * 1e18;
const transferTxnFee = 0.0035 * 1e18;

// Workaround to retry banker on-chain actions which can race with test runs on other PRs
// eslint-disable-next-line consistent-return
export async function withBankerRetry(func: () => Promise<void>, attempt = 1): Promise<void> {
  try {
    await func();
  } catch (e) {
    if (attempt > 5) {
      throw e;
    }

    // 1 block baseline wait
    const waitTime = 2_000;

    // jitter between block * retry count
    const jitter = Math.random() * waitTime * attempt;

    // eslint-disable-next-line no-promise-executor-return
    await new Promise((resolve) => setTimeout(resolve, waitTime + jitter));
    return withBankerRetry(func, attempt + 1);
  }
}

export const givenIHaveAFundedOffererAccount = (
  given: DefineStepFunction,
  banker: Wallet,
  offerer: Wallet,
) => {
  given(/^I have a funded offerer account$/, async () => {
    await withBankerRetry(async () => {
      const fundingTx = await banker.sendTransaction({
        to: offerer.address,
        value: `${imxForApproval}`,
        ...GAS_OVERRIDES,
      });
      await fundingTx.wait(1);
    });
  });
};

export const andTheOffererAccountHasERC721Token = (
  and: DefineStepFunction,
  banker: Wallet,
  offerer: Wallet,
  contractAddress: string,
  tokenIds: string[],
) => {
  and(/^the offerer account has (\d+) ERC721 token$/, async () => {
    const testToken = await connectToTestERC721Token(banker, contractAddress);
    for (const tokenId of tokenIds) {
      // eslint-disable-next-line no-await-in-loop
      await withBankerRetry(async () => {
        // eslint-disable-next-line no-await-in-loop
        const mintTx = await testToken.mint(offerer.address, tokenId, GAS_OVERRIDES);
        // eslint-disable-next-line no-await-in-loop
        await mintTx.wait(1);
      });
    }
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
    await withBankerRetry(async () => {
      const testToken = await connectToTestERC1155Token(banker, contractAddress);
      const mintTx = await testToken.safeMint(offerer.address, tokenId, amount, '0x', GAS_OVERRIDES);
      await mintTx.wait(1);
    });
  });
};

export const andIHaveAFundedFulfillerAccount = (
  and: DefineStepFunction,
  banker: Wallet,
  fulfiller: Wallet,
) => {
  and(/^I have a funded fulfiller account$/, async () => {
    await withBankerRetry(async () => {
      const fundingTx = await banker.sendTransaction({
        to: fulfiller.address,
        value: `${(listingPrice + imxForFulfillment)}`,
        ...GAS_OVERRIDES,
      });

      await fundingTx.wait(1);
    });
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
      orderStart: new Date(2000, 1, 15),
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

export const whenICreateABulkListing = (
  when: DefineStepFunction,
  sdk: orderbook.Orderbook,
  offerer: Wallet,
  contractAddress: string,
  tokenIds: string[],
  setListingId: (listingId: string) => void,
) => {
  when(/^I bulk create listings to sell (\d+) (\w+) tokens?$/, async (amount, tokenType): Promise<void> => {
    const listingParams: any[] = [];
    for (const tokenId of tokenIds) {
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

      listingParams.push({
        buy: {
          amount: `${listingPrice}`,
          type: 'NATIVE',
        },
        sell: sellItem,
        makerFees: [],
        orderStart: new Date(2000, 1, 15),
      });
    }

    const { actions, completeListings } = await sdk.prepareBulkListings({
      makerAddress: offerer.address,
      listingParams,
    });

    const signatures = await actionAll(actions, offerer);
    const { result } = await completeListings(signatures);

    for (const res of result) {
      if (!res.success) {
        throw new Error(`Failed to create listing for order hash: ${res.orderHash}`);
      }
    }

    // Set the listing ID as the second order created to be filled in the next steps
    setListingId(result[1].order?.id!);
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

export const thenTheListingsShouldBeOfStatus = (
  then: DefineStepFunction,
  sdk: orderbook.Orderbook,
  getListingIds: (() => string)[],
) => {
  then(/^the listings should be of status (.*)$/, async (status: string) => {
    for (const getListingId of getListingIds) {
      const listingId = getListingId();
      // eslint-disable-next-line no-await-in-loop
      await waitForOrderToBeOfStatus(sdk, listingId, status);
    }
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

export const whenIFulfillTheListingToBuyWithoutExplicitFulfillmentAmt = (
  when: DefineStepFunction,
  sdk: orderbook.Orderbook,
  fulfiller: Wallet,
  getListingId: () => string,
) => {
  when(/^I fulfill the listing to buy tokens?$/, async () => {
    const listingId = getListingId();
    await fulfillListing(sdk, listingId, fulfiller);
  });
};

export const whenIFulfillBulkListings = (
  when: DefineStepFunction,
  sdk: orderbook.Orderbook,
  fulfiller: Wallet,
  getERC721ListingId: () => string,
  getERC1155ListingId: () => string,
) => {
  when(/^I bulk fulfill the listings with a partial fill of (\d+) units for the ERC1155 listing?$/, async (amount) => {
    const erc721ListingId = getERC721ListingId();
    const erc1155ListingId = getERC1155ListingId();
    await bulkFulfillListings(sdk, [
      { listingId: erc721ListingId },
      { listingId: erc1155ListingId, unitsToFill: amount.toString() },
    ], fulfiller);
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

export const andAnyRemainingFundsAreReturnedToBanker = (
    and: DefineStepFunction,
    banker: Wallet,
    offerer: Wallet,
    fulfiller: Wallet,
) => {
  and(/^any remaining funds are returned to the banker$/, async () => {
    await withBankerRetry(async () => {
      const fulfillerBalance = await fulfiller.provider?.getBalance(fulfiller.address) ?? 0n
      const offererBalance = await offerer.provider?.getBalance(offerer.address) ?? 0n

      if (fulfillerBalance > BigInt(transferTxnFee)) {
        // fulfiller returns funds
        const fulfillerReturnTxn = await fulfiller.sendTransaction({
          to: banker.address,
          value: `${(fulfillerBalance - BigInt(transferTxnFee)).toString()}`,
          ...GAS_OVERRIDES,
        });

        await fulfillerReturnTxn.wait(1);
      }

      if (offererBalance > BigInt(transferTxnFee)) {
        // offerer returns funds
        const offererReturnTxn = await offerer.sendTransaction({
          to: banker.address,
          value: `${(offererBalance - BigInt(transferTxnFee)).toString()}`,
          ...GAS_OVERRIDES,
        });

        await offererReturnTxn.wait(1);
      }
    });
  });
};
