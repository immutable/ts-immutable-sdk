import { Wallet } from 'ethers';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { orderbook } from '@imtbl/sdk';
import { Environment } from '@imtbl/config';
import {
  getConfigFromEnv,
  getRandomTokenId,
} from '../utils/orderbook';
import { RetryProvider } from '../utils/orderbook/retry-provider';
import {
  andIHaveAFundedFulfillerAccount, andTheOffererAccountHasERC1155Tokens,
  andTheOffererAccountHasERC721Token, andERC721TokenShouldBeTransferredToTheFulfiller, andTradeShouldBeAvailable,
  givenIHaveAFundedOffererAccount, thenTheListingShouldBeOfStatus,
  whenICreateAListing, whenIFulfillTheListingToBuy, andERC1155TokensShouldBeTransferredToTheFulfiller,
  thenTheListingsShouldBeOfStatus,
  whenIFulfillBulkListings, whenIFulfillTheListingToBuyWithoutExplicitFulfillmentAmt,
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

  const orderbookConfig = getConfigFromEnv();
  const sdk = new orderbook.Orderbook({
    baseConfig: {
      environment: Environment.SANDBOX,
    },
    overrides: {
      ...orderbookConfig,
    },
  });

  test('creating and fulfilling a ERC721 listing', async ({
    given,
    when,
    then,
    and,
  }) => {
    const offerer = new Wallet(Wallet.createRandom().privateKey, provider);
    const fulfiller = new Wallet(Wallet.createRandom().privateKey, provider);
    const testTokenId = getRandomTokenId();

    let listingId: string = '';

    // these callback functions are required to update / retrieve test level state variables from shared steps.
    const setListingId = (id: string) => {
      listingId = id;
    };

    const getListingId = () => listingId;

    givenIHaveAFundedOffererAccount(given, bankerWallet, offerer);

    andTheOffererAccountHasERC721Token(and, bankerWallet, offerer, erc721ContractAddress, testTokenId);

    andIHaveAFundedFulfillerAccount(and, bankerWallet, fulfiller);

    whenICreateAListing(when, sdk, offerer, erc721ContractAddress, testTokenId, setListingId);

    thenTheListingShouldBeOfStatus(then, sdk, getListingId);

    whenIFulfillTheListingToBuy(when, sdk, fulfiller, getListingId);

    thenTheListingShouldBeOfStatus(then, sdk, getListingId);

    andERC721TokenShouldBeTransferredToTheFulfiller(and, bankerWallet, erc721ContractAddress, testTokenId, fulfiller);

    andTradeShouldBeAvailable(and, sdk, fulfiller, getListingId);
  }, 120_000);

  test('create and completely fill a ERC1155 listing', ({
    given,
    when,
    then,
    and,
  }) => {
    const offerer = new Wallet(Wallet.createRandom().privateKey, provider);
    const fulfiller = new Wallet(Wallet.createRandom().privateKey, provider);
    const testTokenId = getRandomTokenId();

    let listingId: string = '';

    // these callback functions are required to update / retrieve test level state variables from shared steps.
    const setListingId = (id: string) => {
      listingId = id;
    };

    const getListingId = () => listingId;

    givenIHaveAFundedOffererAccount(given, bankerWallet, offerer);

    andTheOffererAccountHasERC1155Tokens(and, bankerWallet, offerer, erc1155ContractAddress, testTokenId);

    andIHaveAFundedFulfillerAccount(and, bankerWallet, fulfiller);

    whenICreateAListing(when, sdk, offerer, erc1155ContractAddress, testTokenId, setListingId);

    thenTheListingShouldBeOfStatus(then, sdk, getListingId);

    whenIFulfillTheListingToBuy(when, sdk, fulfiller, getListingId);

    thenTheListingShouldBeOfStatus(then, sdk, getListingId);

    // eslint-disable-next-line max-len
    andERC1155TokensShouldBeTransferredToTheFulfiller(and, bankerWallet, erc1155ContractAddress, testTokenId, fulfiller);

    andTradeShouldBeAvailable(and, sdk, fulfiller, getListingId);
  }, 120_000);

  test('create and partially fill a ERC1155 listing', ({
    given,
    when,
    then,
    and,
  }) => {
    const offerer = new Wallet(Wallet.createRandom().privateKey, provider);
    const fulfiller = new Wallet(Wallet.createRandom().privateKey, provider);
    const testTokenId = getRandomTokenId();

    let listingId: string = '';

    // these callback functions are required to update / retrieve test level state variables from shared steps.
    const setListingId = (id: string) => {
      listingId = id;
    };

    const getListingId = () => listingId;
    givenIHaveAFundedOffererAccount(given, bankerWallet, offerer);

    andTheOffererAccountHasERC1155Tokens(and, bankerWallet, offerer, erc1155ContractAddress, testTokenId);

    andIHaveAFundedFulfillerAccount(and, bankerWallet, fulfiller);

    whenICreateAListing(when, sdk, offerer, erc1155ContractAddress, testTokenId, setListingId);

    thenTheListingShouldBeOfStatus(then, sdk, getListingId);

    whenIFulfillTheListingToBuy(when, sdk, fulfiller, getListingId);

    thenTheListingShouldBeOfStatus(then, sdk, getListingId);

    // eslint-disable-next-line max-len
    andERC1155TokensShouldBeTransferredToTheFulfiller(and, bankerWallet, erc1155ContractAddress, testTokenId, fulfiller);

    andTradeShouldBeAvailable(and, sdk, fulfiller, getListingId);

    whenIFulfillTheListingToBuy(when, sdk, fulfiller, getListingId);

    thenTheListingShouldBeOfStatus(then, sdk, getListingId);

    // eslint-disable-next-line max-len
    andERC1155TokensShouldBeTransferredToTheFulfiller(and, bankerWallet, erc1155ContractAddress, testTokenId, fulfiller);

    andTradeShouldBeAvailable(and, sdk, fulfiller, getListingId);
  }, 120_000);

  test('create and bulk fill multiple listings', ({
    given,
    when,
    then,
    and,
  }) => {
    const offerer = new Wallet(Wallet.createRandom().privateKey, provider);
    const fulfiller = new Wallet(Wallet.createRandom().privateKey, provider);
    const testERC721TokenId = getRandomTokenId();
    const testERC1155TokenId = getRandomTokenId();

    let erc721listingId: string = '';
    // We will partially fill the erc1155 listing ID
    let erc1155listingId: string = '';

    // these callback functions are required to update / retrieve test level state variables from shared steps.
    const setERC721ListingId = (id: string) => {
      erc721listingId = id;
    };

    const setERC1155ListingId = (id: string) => {
      erc1155listingId = id;
    };

    const getERC721ListingId = () => erc721listingId;
    const getERC1155ListingId = () => erc1155listingId;

    givenIHaveAFundedOffererAccount(given, bankerWallet, offerer);

    andTheOffererAccountHasERC1155Tokens(and, bankerWallet, offerer, erc1155ContractAddress, testERC1155TokenId);

    andTheOffererAccountHasERC721Token(and, bankerWallet, offerer, erc721ContractAddress, testERC721TokenId);

    andIHaveAFundedFulfillerAccount(and, bankerWallet, fulfiller);

    whenICreateAListing(when, sdk, offerer, erc1155ContractAddress, testERC1155TokenId, setERC1155ListingId);

    whenICreateAListing(when, sdk, offerer, erc721ContractAddress, testERC721TokenId, setERC721ListingId);

    thenTheListingsShouldBeOfStatus(then, sdk, [getERC721ListingId, getERC1155ListingId]);

    whenIFulfillBulkListings(when, sdk, fulfiller, getERC721ListingId, getERC1155ListingId);

    thenTheListingShouldBeOfStatus(then, sdk, getERC721ListingId);

    // eslint-disable-next-line max-len
    andERC1155TokensShouldBeTransferredToTheFulfiller(and, bankerWallet, erc1155ContractAddress, testERC1155TokenId, fulfiller);

    thenTheListingShouldBeOfStatus(then, sdk, getERC1155ListingId);

    andTradeShouldBeAvailable(and, sdk, fulfiller, getERC1155ListingId);
  }, 120_000);

  test('create and fully fill a ERC1155 listing without an explicit fulfill amount', ({
    given,
    when,
    then,
    and,
  }) => {
    const offerer = new Wallet(Wallet.createRandom().privateKey, provider);
    const fulfiller = new Wallet(Wallet.createRandom().privateKey, provider);
    const testTokenId = getRandomTokenId();

    let listingId: string = '';

    // these callback functions are required to update / retrieve test level state variables from shared steps.
    const setListingId = (id: string) => {
      listingId = id;
    };

    const getListingId = () => listingId;
    givenIHaveAFundedOffererAccount(given, bankerWallet, offerer);

    andTheOffererAccountHasERC1155Tokens(and, bankerWallet, offerer, erc1155ContractAddress, testTokenId);

    andIHaveAFundedFulfillerAccount(and, bankerWallet, fulfiller);

    whenICreateAListing(when, sdk, offerer, erc1155ContractAddress, testTokenId, setListingId);

    thenTheListingShouldBeOfStatus(then, sdk, getListingId);

    whenIFulfillTheListingToBuyWithoutExplicitFulfillmentAmt(when, sdk, fulfiller, getListingId);

    thenTheListingShouldBeOfStatus(then, sdk, getListingId);

    // eslint-disable-next-line max-len
    andERC1155TokensShouldBeTransferredToTheFulfiller(and, bankerWallet, erc1155ContractAddress, testTokenId, fulfiller);

    andTradeShouldBeAvailable(and, sdk, fulfiller, getListingId);
  }, 120_000);

  test('create and partially fill a ERC1155 listing, second fill without explicit amount', ({
    given,
    when,
    then,
    and,
  }) => {
    const offerer = new Wallet(Wallet.createRandom().privateKey, provider);
    const fulfiller = new Wallet(Wallet.createRandom().privateKey, provider);
    const testTokenId = getRandomTokenId();

    let listingId: string = '';

    // these callback functions are required to update / retrieve test level state variables from shared steps.
    const setListingId = (id: string) => {
      listingId = id;
    };

    const getListingId = () => listingId;
    givenIHaveAFundedOffererAccount(given, bankerWallet, offerer);

    andTheOffererAccountHasERC1155Tokens(and, bankerWallet, offerer, erc1155ContractAddress, testTokenId);

    andIHaveAFundedFulfillerAccount(and, bankerWallet, fulfiller);

    whenICreateAListing(when, sdk, offerer, erc1155ContractAddress, testTokenId, setListingId);

    thenTheListingShouldBeOfStatus(then, sdk, getListingId);

    whenIFulfillTheListingToBuy(when, sdk, fulfiller, getListingId);

    thenTheListingShouldBeOfStatus(then, sdk, getListingId);

    // eslint-disable-next-line max-len
    andERC1155TokensShouldBeTransferredToTheFulfiller(and, bankerWallet, erc1155ContractAddress, testTokenId, fulfiller);

    andTradeShouldBeAvailable(and, sdk, fulfiller, getListingId);

    whenIFulfillTheListingToBuyWithoutExplicitFulfillmentAmt(when, sdk, fulfiller, getListingId);

    thenTheListingShouldBeOfStatus(then, sdk, getListingId);

    // eslint-disable-next-line max-len
    andERC1155TokensShouldBeTransferredToTheFulfiller(and, bankerWallet, erc1155ContractAddress, testTokenId, fulfiller);

    andTradeShouldBeAvailable(and, sdk, fulfiller, getListingId);
  }, 120_000);
});
