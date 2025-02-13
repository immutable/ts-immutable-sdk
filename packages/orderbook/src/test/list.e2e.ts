import { Wallet } from 'ethers';
import { Environment } from '@imtbl/config';
import { OrderStatusName } from '../openapi/sdk';
import { Orderbook } from '../orderbook';
import { getLocalhostProvider } from './helpers/provider';
import { getOffererWallet } from './helpers/signers';
import { deployTestToken } from './helpers/erc721';
import { waitForOrderToBeOfStatus } from './helpers/order';
import { getConfigFromEnv, getRandomTokenId, TestERC721Token } from './helpers';
import { actionAll } from './helpers/actions';
import { Order } from '../types';

async function createListing(
  sdk: Orderbook,
  token: TestERC721Token,
  tokenId: string,
  considerationAmount: string,
  offerer: Wallet,
): Promise<Order> {
  const listing = await sdk.prepareListing({
    makerAddress: offerer.address,
    buy: {
      amount: considerationAmount,
      type: 'NATIVE',
    },
    sell: {
      contractAddress: await token.getAddress(),
      tokenId,
      type: 'ERC721',
    },
  });

  const signatures = await actionAll(listing.actions, offerer);

  const {
    result: { id: orderId },
  } = await sdk.createListing({
    orderComponents: listing.orderComponents,
    orderHash: listing.orderHash,
    orderSignature: signatures[0],
    makerFees: [],
  });

  return waitForOrderToBeOfStatus(sdk, orderId, OrderStatusName.ACTIVE);
}

describe('listListings e2e', () => {
  const provider = getLocalhostProvider();
  const offerer = getOffererWallet(provider);

  const localConfigOverrides = getConfigFromEnv();
  const sdk = new Orderbook({
    baseConfig: {
      environment: Environment.SANDBOX,
    },
    overrides: {
      ...localConfigOverrides,
    },
  });

  let token1ContractAddress = '';
  let token2ContractAddress = '';
  let token1Order1: Order;
  let token1Order2: Order;
  let token2Order1: Order;

  beforeAll(async () => {
    const { contract } = await deployTestToken(offerer);
    await contract.safeMint(offerer.address, getRandomTokenId());
    await contract.safeMint(offerer.address, getRandomTokenId());
    token1ContractAddress = await contract.getAddress();

    const { contract: contract2 } = await deployTestToken(offerer);
    await contract2.safeMint(offerer.address, getRandomTokenId());
    token2ContractAddress = await contract2.getAddress();

    token1Order1 = await createListing(
      sdk,
      contract,
      '0',
      '2000000',
      offerer,
    );
    token1Order2 = await createListing(
      sdk,
      contract,
      '1',
      '1000000',
      offerer,
    );
    token2Order1 = await createListing(
      sdk,
      contract2,
      '0',
      '1000000',
      offerer,
    );
  }, 90_000);

  it('should list orders by collection', async () => {
    const ordersPage = await sdk.listListings({
      sellItemContractAddress: token1ContractAddress,
      status: OrderStatusName.ACTIVE,
    });

    expect(ordersPage.result.length).toBe(2);
    expect(ordersPage.result[0].id).toEqual(token1Order2.id);
    expect(ordersPage.result[1].id).toEqual(token1Order1.id);
    expect(ordersPage.page?.nextCursor).toBeNull();
    expect(ordersPage.page?.previousCursor).toBeNull();
  });

  it('should list orders by tokenID', async () => {
    const ordersPage = await sdk.listListings({
      sellItemContractAddress: token2ContractAddress,
      sellItemTokenId: '0',
      status: OrderStatusName.ACTIVE,
    });

    expect(ordersPage.result.length).toBe(1);
    expect(ordersPage.result[0].id).toEqual(token2Order1.id);
    expect(ordersPage.page?.nextCursor).toBeNull();
    expect(ordersPage.page?.previousCursor).toBeNull();
  });

  it('should sort orders by buy amount', async () => {
    const ordersPage = await sdk.listListings({
      sellItemContractAddress: token1ContractAddress,
      status: OrderStatusName.ACTIVE,
      sortBy: 'buy_item_amount',
    });

    expect(ordersPage.result.length).toBe(2);
    expect(ordersPage.result[0].id).toEqual(token1Order1.id);
    expect(ordersPage.result[1].id).toEqual(token1Order2.id);
    expect(ordersPage.page?.nextCursor).toBeNull();
    expect(ordersPage.page?.previousCursor).toBeNull();
  });

  it('should page orders', async () => {
    const ordersPage1 = await sdk.listListings({
      sellItemContractAddress: token1ContractAddress,
      status: OrderStatusName.ACTIVE,
      pageSize: 1,
    });

    expect(ordersPage1.result.length).toBe(1);
    expect(ordersPage1.result[0].id).toEqual(token1Order2.id);
    expect(ordersPage1.page?.nextCursor).toBeTruthy();
    expect(ordersPage1.page?.previousCursor).toBeNull();

    const ordersPage2 = await sdk.listListings({
      sellItemContractAddress: token1ContractAddress,
      status: OrderStatusName.ACTIVE,
      pageSize: 1,
      pageCursor: ordersPage1.page!.nextCursor!,
    });

    expect(ordersPage2.result.length).toBe(1);
    expect(ordersPage2.result[0].id).toEqual(token1Order1.id);
    expect(ordersPage2.page?.nextCursor).toBeTruthy();
    expect(ordersPage2.page?.previousCursor).toBeTruthy();

    const ordersPage3 = await sdk.listListings({
      sellItemContractAddress: token1ContractAddress,
      status: OrderStatusName.ACTIVE,
      pageSize: 1,
      pageCursor: ordersPage2.page!.nextCursor!,
    });

    expect(ordersPage3.result.length).toBe(0);
    expect(ordersPage3.page?.nextCursor).toBeNull();
    expect(ordersPage3.page?.previousCursor).toBeNull();
  });
});
