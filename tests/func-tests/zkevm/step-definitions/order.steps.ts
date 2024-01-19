import { Wallet } from 'ethers';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { orderbook } from '@imtbl/sdk';
import { Environment } from '@imtbl/config';
import {
  connectToTestToken,
  getConfigFromEnv,
  getRandomTokenId,
  waitForOrderToBeOfStatus,
} from '../utils/orderbook';
import { GAS_OVERRIDES } from '../utils/orderbook/gas';
import { actionAll } from '../utils/orderbook/actions';
import { RetryProvider } from '../utils/orderbook/retry-provider';

const feature = loadFeature('features/order.feature', { tagFilter: process.env.TAGS });

defineFeature(feature, (test) => {
  test('creating and fulfilling a listing', ({
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

    given(/^I have have a funded offerer account with a minted NFT$/, async () => {
      const fundingTx = await bankerWallet.sendTransaction({
        to: offerer.address,
        value: `${imxForApproval}`,
        ...GAS_OVERRIDES,
      });

      await fundingTx.wait(1);

      const testToken = await connectToTestToken(bankerWallet, erc721ContractAddress);
      const mintTx = await testToken.mint(offerer.address, testTokenId, GAS_OVERRIDES);
      await mintTx.wait(1);
    });

    and(/^I have have a funded fulfiller account$/, async () => {
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

    then(/^the listing should be active$/, async () => {
      await waitForOrderToBeOfStatus(sdk, listingId, orderbook.OrderStatusName.ACTIVE);
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
      const testToken = await connectToTestToken(bankerWallet, erc721ContractAddress);
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
});
