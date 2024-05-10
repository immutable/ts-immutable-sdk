import { Wallet } from 'ethers';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { orderbook } from '@imtbl/sdk';
import { Environment } from '@imtbl/config';
import {
  connectToTestERC1155Token,
  connectToTestERC721Token, createListing, fulfillListing,
  getConfigFromEnv,
  getRandomTokenId, getTrades, prepareERC1155Listing,
  waitForOrderToBeOfStatus,
} from '../utils/orderbook';
import { actionAll } from '../utils/orderbook/actions';
import { RetryProvider } from '../utils/orderbook/retry-provider';
import {
  andIHaveAFundedFulfillerAccount, andTheOffererAccountHasERC1155Tokens,
  andTheOffererAccountHasERC721Token,
  givenIHaveAFundedOffererAccount,
  whenICreateAListing,
} from './shared';

const feature = loadFeature('features/order.feature', { tagFilter: process.env.TAGS });

defineFeature(feature, (test) => {
  const bankerKey = process.env.ZKEVM_ORDERBOOK_BANKER;
  const erc721ContractAddress = process.env.ZKEVM_ORDERBOOK_ERC721;
  const erc1155ContractAddress = process.env.ZKEVM_ORDERBOOK_ERC1155;
  const rpcUrl = process.env.ZKEVM_RPC_ENDPOINT;

  if (!bankerKey || !erc721ContractAddress || !rpcUrl || !erc1155ContractAddress) {
    throw new Error('missing config for orderbook tests');
  }

  const provider = new RetryProvider(rpcUrl);
  const bankerWallet = new Wallet(bankerKey, provider);

  test('creating and fulfilling a ERC721 listing', async ({
    given,
    when,
    then,
    and,
  }) => {
    const orderbookConfig = getConfigFromEnv();
    const sdk = new orderbook.Orderbook({
      baseConfig: {
        environment: Environment.SANDBOX,
      },
      overrides: {
        ...orderbookConfig,
      },
    });

    const offerer = new Wallet(Wallet.createRandom().privateKey, provider);
    const fulfiller = new Wallet(Wallet.createRandom().privateKey, provider);
    const testTokenId = getRandomTokenId();
    let listingId: string = '';
    const setListingId = (id: string) => {
      listingId = id;
    };

    givenIHaveAFundedOffererAccount(given, bankerWallet, offerer);

    andTheOffererAccountHasERC721Token(and, bankerWallet, offerer, erc721ContractAddress, testTokenId);

    andIHaveAFundedFulfillerAccount(and, bankerWallet, fulfiller);

    whenICreateAListing(when, sdk, offerer, erc721ContractAddress, testTokenId, setListingId);

    then(/^the listing should be (.*)$/, async (status: string) => {
      await waitForOrderToBeOfStatus(sdk, listingId, status);
    });

    and(/^when I fulfill the listing$/, async () => {
      await fulfillListing(sdk, listingId, fulfiller);
    });

    then(/^the listing should be (.*)$/, async (status: string) => {
      await waitForOrderToBeOfStatus(sdk, listingId, status);
    });

    and(/^the NFT should be transferred to the fulfiller$/, async () => {
      const testToken = await connectToTestERC721Token(bankerWallet, erc721ContractAddress);
      const ownerOf = await testToken.ownerOf(testTokenId);
      expect(ownerOf).toEqual(fulfiller.address);
    });

    and(/^(\d+) trade should be available$/, async (count) => {
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

      expect(targetTrades).toBeDefined();
    });
  }, 120_000);

  test('create and completely fill a ERC1155 listing', ({
    given,
    when,
    then,
    and,
  }) => {
    const orderbookConfig = getConfigFromEnv();
    const sdk = new orderbook.Orderbook({
      baseConfig: {
        environment: Environment.SANDBOX,
      },
      overrides: {
        ...orderbookConfig,
      },
    });

    const offerer = new Wallet(Wallet.createRandom().privateKey, provider);
    const fulfiller = new Wallet(Wallet.createRandom().privateKey, provider);
    const testTokenId = getRandomTokenId();
    const listingPrice = 0.0001 * 1e18;
    let listingId: string = '';

    givenIHaveAFundedOffererAccount(given, bankerWallet, offerer);

    andTheOffererAccountHasERC1155Tokens(and, bankerWallet, offerer, erc1155ContractAddress, testTokenId);

    andIHaveAFundedFulfillerAccount(and, bankerWallet, fulfiller);

    when(/^I create a listing to sell (\d+) tokens$/, async (amount) => {
      // eslint-disable-next-line max-len
      const prepareListing = await prepareERC1155Listing(sdk, offerer, erc1155ContractAddress, testTokenId, listingPrice, amount.toString());

      const signatures = await actionAll(prepareListing.actions, offerer);

      const { result } = await createListing(sdk, prepareListing, signatures[0]);
      listingId = result.id;
    });

    then(/^the listing should be (.*)$/, async (status: string) => {
      await waitForOrderToBeOfStatus(sdk, listingId, status);
    });

    and(/^when I fulfill the listing to buy (\d+) tokens$/, async (amount) => {
      await fulfillListing(sdk, listingId, fulfiller, amount.toString());
    });

    then(/^the listing should be (.*)$/, async (status: string) => {
      await waitForOrderToBeOfStatus(sdk, listingId, status);
    });

    and(/^(\d+) tokens should be transferred to the fulfiller$/, async (amount) => {
      const testToken = await connectToTestERC1155Token(bankerWallet, erc1155ContractAddress);
      const balance = await testToken.balanceOf(fulfiller.address, testTokenId);
      expect(balance.toString()).toEqual(amount.toString());
    });

    and(/^(\d+) trade should be available$/, async (count) => {
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

      expect(targetTrades).toBeDefined();
    });
  }, 120_000);

  test('create and partially fill a ERC1155 listing', ({
    given,
    when,
    then,
    and,
  }) => {
    const orderbookConfig = getConfigFromEnv();
    const sdk = new orderbook.Orderbook({
      baseConfig: {
        environment: Environment.SANDBOX,
      },
      overrides: {
        ...orderbookConfig,
      },
    });

    const offerer = new Wallet(Wallet.createRandom().privateKey, provider);
    const fulfiller = new Wallet(Wallet.createRandom().privateKey, provider);
    const testTokenId = getRandomTokenId();
    const listingPrice = 0.0001 * 1e18;
    let listingId: string = '';

    givenIHaveAFundedOffererAccount(given, bankerWallet, offerer);

    andTheOffererAccountHasERC1155Tokens(and, bankerWallet, offerer, erc1155ContractAddress, testTokenId);

    andIHaveAFundedFulfillerAccount(and, bankerWallet, fulfiller);

    when(/^I create a listing to sell (\d+) tokens$/, async (amount) => {
      // eslint-disable-next-line max-len
      const prepareListing = await prepareERC1155Listing(sdk, offerer, erc1155ContractAddress, testTokenId, listingPrice, amount.toString());

      const signatures = await actionAll(prepareListing.actions, offerer);

      const { result } = await createListing(sdk, prepareListing, signatures[0]);
      listingId = result.id;
    });

    then(/^the listing should be (.*)$/, async (status: string) => {
      await waitForOrderToBeOfStatus(sdk, listingId, status);
    });

    and(/^when I fulfill the listing to buy (\d+) tokens$/, async (amount) => {
      await fulfillListing(sdk, listingId, fulfiller, amount.toString());
    });

    then(/^the listing should be (.*)$/, async (status: string) => {
      await waitForOrderToBeOfStatus(sdk, listingId, status);
    });

    and(/^(\d+) tokens should be transferred to the fulfiller$/, async (amount) => {
      const testToken = await connectToTestERC1155Token(bankerWallet, erc1155ContractAddress);
      const balance = await testToken.balanceOf(fulfiller.address, testTokenId);
      expect(balance.toString()).toEqual(amount.toString());
    });

    and(/^(\d+) trade should be available$/, async (count) => {
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

      expect(targetTrades).toBeDefined();
    });

    and(/^when I fulfill the listing to buy (\d+) tokens$/, async (amount) => {
      await fulfillListing(sdk, listingId, fulfiller, amount.toString());
    });

    then(/^the listing should be (.*)$/, async (status: string) => {
      await waitForOrderToBeOfStatus(sdk, listingId, status);
    });

    and(/^(\d+) tokens should be transferred to the fulfiller$/, async (amount) => {
      const testToken = await connectToTestERC1155Token(bankerWallet, erc1155ContractAddress);
      const balance = await testToken.balanceOf(fulfiller.address, testTokenId);
      expect(balance.toString()).toEqual(amount.toString());
    });

    and(/^(\d+) trades should be available$/, async (count) => {
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

      expect(targetTrades).toBeDefined();
    });
  }, 120_000);
});
