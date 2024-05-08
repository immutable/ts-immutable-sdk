import { Wallet } from 'ethers';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { orderbook } from '@imtbl/sdk';
import { Environment } from '@imtbl/config';
import {
  connectToTestERC1155Token,
  connectToTestERC721Token,
  getConfigFromEnv,
  getRandomTokenId,
  waitForOrderToBeOfStatus,
} from '../utils/orderbook';
import { GAS_OVERRIDES } from '../utils/orderbook/gas';
import { actionAll } from '../utils/orderbook/actions';
import { RetryProvider } from '../utils/orderbook/retry-provider';

const feature = loadFeature('features/order.feature', { tagFilter: process.env.TAGS });

defineFeature(feature, (test) => {
  test('creating and fulfilling a ERC721 listing', ({
    given,
    when,
    then,
    and,
  }) => {
    const bankerKey = process.env.ZKEVM_ORDERBOOK_BANKER;
    const erc721ContractAddress = process.env.ZKEVM_ORDERBOOK_ERC721;
    const rpcUrl = process.env.ZKEVM_RPC_ENDPOINT;

    if (!bankerKey || !erc721ContractAddress || !rpcUrl) {
      throw new Error('missing config for orderbook tests');
    }

    const provider = new RetryProvider(rpcUrl);
    const bankerWallet = new Wallet(bankerKey, provider);

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

    const imxForApproval = 0.01 * 1e18;
    const imxForFulfillment = 0.04 * 1e18;
    const listingPrice = 0.0001 * 1e18;
    let listingId: string = '';

    given(/^I have a funded offerer account with a minted NFT$/, async () => {
      const fundingTx = await bankerWallet.sendTransaction({
        to: offerer.address,
        value: `${imxForApproval}`,
        ...GAS_OVERRIDES,
      });

      await fundingTx.wait(1);

      const testToken = await connectToTestERC721Token(bankerWallet, erc721ContractAddress);
      const mintTx = await testToken.mint(offerer.address, testTokenId, GAS_OVERRIDES);
      await mintTx.wait(1);
    });

    and(/^I have a funded fulfiller account$/, async () => {
      const fundingTx = await bankerWallet.sendTransaction({
        to: fulfiller.address,
        value: `${(listingPrice + imxForFulfillment)}`,
        ...GAS_OVERRIDES,
      });

      await fundingTx.wait(1);
    });

    when(/^I create a listing$/, async () => {
      const listing = await sdk.prepareListing({
        makerAddress: offerer.address,
        buy: {
          amount: `${listingPrice}`,
          type: 'NATIVE',
        },
        sell: {
          contractAddress: erc721ContractAddress,
          tokenId: testTokenId,
          type: 'ERC721',
        },
      });

      const signatures = await actionAll(listing.actions, offerer);

      const { result } = await sdk.createListing({
        orderComponents: listing.orderComponents,
        orderHash: listing.orderHash,
        orderSignature: signatures[0],
        makerFees: [],
      });
      listingId = result.id;
    });

    then(/^the listing should be (.*)$/, async (status: string) => {
      let orderStatus;
      if (status === 'active') {
        orderStatus = orderbook.OrderStatusName.ACTIVE;
      } else if (status === 'filled') {
        orderStatus = orderbook.OrderStatusName.FILLED;
      } else {
        throw new Error(`Unrecognized order status: ${status}`);
      }

      await waitForOrderToBeOfStatus(sdk, listingId, orderStatus);
    });

    and(/^when I fulfill the listing$/, async () => {
      const fulfillment = await sdk.fulfillOrder(
        listingId,
        fulfiller.address,
        [],
      );

      await actionAll(fulfillment.actions, fulfiller);
    });

    then(/^the listing should be filled$/, async () => {
      await waitForOrderToBeOfStatus(sdk, listingId, orderbook.OrderStatusName.FILLED);
    });

    and(/^the NFT should be transferred to the fulfiller$/, async () => {
      const testToken = await connectToTestERC721Token(bankerWallet, erc721ContractAddress);
      const ownerOf = await testToken.ownerOf(testTokenId);
      expect(ownerOf).toEqual(fulfiller.address);
    });

    and(/^the trade data should be available$/, async () => {
      let attempt = 0;
      let targetTrade: orderbook.Trade | undefined;
      while (attempt < 5 && !targetTrade) {
        // eslint-disable-next-line no-await-in-loop
        const trades = await sdk.listTrades({
          accountAddress: fulfiller.address,
          sortBy: 'indexed_at',
          sortDirection: 'desc',
          pageSize: 10,
        });

        // eslint-disable-next-line @typescript-eslint/no-loop-func
        targetTrade = trades.result.find((t) => t.orderId === listingId);
        if (!targetTrade) {
          // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
          await new Promise((resolve) => setTimeout(resolve, 5_000));
        }

        attempt++;
      }

      expect(targetTrade).toBeDefined();
    });
  }, 120_000);

  test('create and completely fill a ERC1155 listing', ({
    given,
    when,
    then,
    and,
  }) => {
    const bankerKey = process.env.ZKEVM_ORDERBOOK_BANKER;
    const erc1155ContractAddress = process.env.ZKEVM_ORDERBOOK_ERC1155;
    const rpcUrl = process.env.ZKEVM_RPC_ENDPOINT;

    if (!bankerKey || !erc1155ContractAddress || !rpcUrl) {
      throw new Error('missing config for orderbook tests');
    }

    const provider = new RetryProvider(rpcUrl);
    const bankerWallet = new Wallet(bankerKey, provider);

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

    const imxForApproval = 0.01 * 1e18;
    const imxForFulfillment = 0.04 * 1e18;
    const listingPrice = 0.0001 * 1e18;
    let listingId: string = '';

    given(/^I have a funded offerer account with (\d+) ERC1155 tokens$/, async (amount) => {
      const fundingTx = await bankerWallet.sendTransaction({
        to: offerer.address,
        value: `${imxForApproval}`,
        ...GAS_OVERRIDES,
      });

      await fundingTx.wait(1);

      const testToken = await connectToTestERC1155Token(bankerWallet, erc1155ContractAddress);
      const mintTx = await testToken.safeMint(offerer.address, testTokenId, amount, '0x', GAS_OVERRIDES);
      await mintTx.wait(1);
    });

    and(/^I have a funded fulfiller account$/, async () => {
      const fundingTx = await bankerWallet.sendTransaction({
        to: fulfiller.address,
        value: `${(listingPrice + imxForFulfillment)}`,
        ...GAS_OVERRIDES,
      });

      await fundingTx.wait(1);
    });

    when(/^I create a listing to sell (\d+) tokens$/, async (amount) => {
      const listing = await sdk.prepareListing({
        makerAddress: offerer.address,
        buy: {
          amount: `${listingPrice}`,
          type: 'NATIVE',
        },
        sell: {
          contractAddress: erc1155ContractAddress,
          tokenId: testTokenId,
          type: 'ERC1155',
          amount: amount.toString(),
        },
      });

      const signatures = await actionAll(listing.actions, offerer);

      const { result } = await sdk.createListing({
        orderComponents: listing.orderComponents,
        orderHash: listing.orderHash,
        orderSignature: signatures[0],
        makerFees: [],
      });
      listingId = result.id;
    });

    then(/^the listing should be active$/, async () => {
      await waitForOrderToBeOfStatus(sdk, listingId, orderbook.OrderStatusName.ACTIVE);
    });

    and(/^when I fulfill the listing to buy (\d+) tokens$/, async (amount) => {
      const fulfillment = await sdk.fulfillOrder(
        listingId,
        fulfiller.address,
        [],
        amount.toString(),
      );
      await actionAll(fulfillment.actions, fulfiller);
    });

    then(/^the listing should be filled$/, async () => {
      await waitForOrderToBeOfStatus(sdk, listingId, orderbook.OrderStatusName.FILLED);
    });

    and(/^(\d+) tokens should be transferred to the fulfiller$/, async (amount) => {
      const testToken = await connectToTestERC1155Token(bankerWallet, erc1155ContractAddress);
      const balance = await testToken.balanceOf(fulfiller.address, testTokenId);
      expect(balance.toString()).toEqual(amount.toString());
    });

    and(/^the trade data should be available$/, async () => {
      let attempt = 0;
      let targetTrade: orderbook.Trade | undefined;
      while (attempt < 5 && !targetTrade) {
        // eslint-disable-next-line no-await-in-loop
        const trades = await sdk.listTrades({
          accountAddress: fulfiller.address,
          sortBy: 'indexed_at',
          sortDirection: 'desc',
          pageSize: 10,
        });

        // eslint-disable-next-line @typescript-eslint/no-loop-func
        targetTrade = trades.result.find((t) => t.orderId === listingId);
        if (!targetTrade) {
          // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
          await new Promise((resolve) => setTimeout(resolve, 5_000));
        }

        attempt++;
      }

      expect(targetTrade).toBeDefined();
    });
  }, 120_000);

  test('create and partially fill a ERC1155 listing', ({
    given,
    when,
    then,
    and,
  }) => {
    const bankerKey = process.env.ZKEVM_ORDERBOOK_BANKER;
    const erc1155ContractAddress = process.env.ZKEVM_ORDERBOOK_ERC1155;
    const rpcUrl = process.env.ZKEVM_RPC_ENDPOINT;

    if (!bankerKey || !erc1155ContractAddress || !rpcUrl) {
      throw new Error('missing config for orderbook tests');
    }

    const provider = new RetryProvider(rpcUrl);
    const bankerWallet = new Wallet(bankerKey, provider);

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

    const imxForApproval = 0.01 * 1e18;
    const imxForFulfillment = 0.04 * 1e18;
    const listingPrice = 0.0001 * 1e18;
    let listingId: string = '';

    given(/^I have a funded offerer account with (\d+) ERC1155 tokens$/, async (amount) => {
      const fundingTx = await bankerWallet.sendTransaction({
        to: offerer.address,
        value: `${imxForApproval}`,
        ...GAS_OVERRIDES,
      });

      await fundingTx.wait(1);

      const testToken = await connectToTestERC1155Token(bankerWallet, erc1155ContractAddress);
      const mintTx = await testToken.safeMint(offerer.address, testTokenId, amount, '0x', GAS_OVERRIDES);
      await mintTx.wait(1);
    });

    and(/^I have a funded fulfiller account$/, async () => {
      const fundingTx = await bankerWallet.sendTransaction({
        to: fulfiller.address,
        value: `${(listingPrice + imxForFulfillment)}`,
        ...GAS_OVERRIDES,
      });

      await fundingTx.wait(1);
    });

    when(/^I create a listing to sell (\d+) tokens$/, async (amount) => {
      const listing = await sdk.prepareListing({
        makerAddress: offerer.address,
        buy: {
          amount: `${listingPrice}`,
          type: 'NATIVE',
        },
        sell: {
          contractAddress: erc1155ContractAddress,
          tokenId: testTokenId,
          type: 'ERC1155',
          amount: amount.toString(),
        },
      });

      const signatures = await actionAll(listing.actions, offerer);

      const { result } = await sdk.createListing({
        orderComponents: listing.orderComponents,
        orderHash: listing.orderHash,
        orderSignature: signatures[0],
        makerFees: [],
      });
      listingId = result.id;
    });

    then(/^the listing should be active$/, async () => {
      await waitForOrderToBeOfStatus(sdk, listingId, orderbook.OrderStatusName.ACTIVE);
    });

    and(/^when I fulfill the listing to buy (\d+) tokens$/, async (amount) => {
      const fulfillment = await sdk.fulfillOrder(
        listingId,
        fulfiller.address,
        [],
        amount.toString(),
      );

      await actionAll(fulfillment.actions, fulfiller);
    });

    then(/^the listing should be active$/, async () => {
      await waitForOrderToBeOfStatus(sdk, listingId, orderbook.OrderStatusName.ACTIVE);
    });

    and(/^(\d+) tokens should be transferred to the fulfiller$/, async (amount) => {
      const testToken = await connectToTestERC1155Token(bankerWallet, erc1155ContractAddress);
      const balance = await testToken.balanceOf(fulfiller.address, testTokenId);
      expect(balance.toString()).toEqual(amount.toString());
    });

    and(/^(\d+) trade data should be available$/, async (count) => {
      let attempt = 0;
      let targetTrades: orderbook.Trade[] | undefined;
      while (attempt < 5 && !targetTrades) {
        // eslint-disable-next-line no-await-in-loop
        const trades = await sdk.listTrades({
          accountAddress: fulfiller.address,
          sortBy: 'indexed_at',
          sortDirection: 'desc',
          pageSize: 10,
        });

        // eslint-disable-next-line @typescript-eslint/no-loop-func
        targetTrades = trades.result.filter((t) => t.orderId === listingId);
        if (targetTrades.length !== count) {
          // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
          await new Promise((resolve) => setTimeout(resolve, 5_000));
        }

        attempt++;
      }

      expect(targetTrades).toBeDefined();
    });

    and(/^when I fulfill the listing to buy (\d+) tokens$/, async (amount) => {
      const fulfillment = await sdk.fulfillOrder(
        listingId,
        fulfiller.address,
        [],
        amount.toString(),
      );

      await actionAll(fulfillment.actions, fulfiller);
    });

    then(/^the listing should be filled$/, async () => {
      await waitForOrderToBeOfStatus(sdk, listingId, orderbook.OrderStatusName.FILLED);
    });

    and(/^(\d+) tokens should be transferred to the fulfiller$/, async (amount) => {
      const testToken = await connectToTestERC1155Token(bankerWallet, erc1155ContractAddress);
      const balance = await testToken.balanceOf(fulfiller.address, testTokenId);
      expect(balance.toString()).toEqual(amount.toString());
    });

    and(/^(\d+) trade data should be available$/, async (count) => {
      let attempt = 0;
      let targetTrades: orderbook.Trade[] | undefined;
      while (attempt < 5 && !targetTrades) {
        // eslint-disable-next-line no-await-in-loop
        const trades = await sdk.listTrades({
          accountAddress: fulfiller.address,
          sortBy: 'indexed_at',
          sortDirection: 'desc',
          pageSize: 10,
        });

        // eslint-disable-next-line @typescript-eslint/no-loop-func
        targetTrades = trades.result.filter((t) => t.orderId === listingId);
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
