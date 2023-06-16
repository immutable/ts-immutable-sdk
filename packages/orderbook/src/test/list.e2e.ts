import { Wallet, providers } from 'ethers';
import { Environment } from '@imtbl/config';
import { Order, OrderStatus } from 'openapi/sdk';
import { Orderbook } from 'orderbook';
import { getLocalhostProvider } from './helpers/provider';
import { getConfig } from './helpers/config';
import { getOffererWallet } from './helpers/signers';
import { deployTestToken } from './helpers/erc721';
import { signAndSubmitTx, signMessage } from './helpers/sign-and-submit';
import { TestToken } from './helpers/test-token';
import { waitForOrderToBeOfStatus } from './helpers/order';

const LOCAL_CHAIN_NAME = 'imtbl-zkevm-local';

async function createOrder(
  sdk: Orderbook,
  token: TestToken,
  tokenId: string,
  considerationAmount: string,
  offerer: Wallet,
  provider: providers.Provider,
): Promise<Order> {
  const listing = await sdk.prepareListing({
    offerer: offerer.address,
    considerationItem: {
      amount: considerationAmount,
      type: 'NATIVE',
    },
    listingItem: {
      contractAddress: token.address,
      tokenId,
      type: 'ERC721',
    },
  });

  if (listing.unsignedApprovalTransaction) {
    await signAndSubmitTx(listing.unsignedApprovalTransaction, offerer, provider);
  }

  const signature = await signMessage(
    listing.typedOrderMessageForSigning,
    offerer,
  );

  const { result: { id: orderId } } = await sdk.createOrder({
    offerer: offerer.address,
    orderComponents: listing.orderComponents,
    orderHash: listing.orderHash,
    orderSignature: signature,
  });

  return waitForOrderToBeOfStatus(sdk, orderId, OrderStatus.ACTIVE);
}

describe('listOrders e2e', () => {
  const config = getConfig();
  const provider = getLocalhostProvider();
  const offerer = getOffererWallet(provider);

  const sdk = new Orderbook({
    baseConfig: {
      environment: Environment.SANDBOX,
    },
    provider: getLocalhostProvider(),
    seaportContractAddress: config.seaportContractAddress,
    zoneContractAddress: config.zoneContractAddress,
    overrides: {
      apiEndpoint: config.apiUrl,
      chainName: LOCAL_CHAIN_NAME,
    },
  });

  let token1ContractAddress = '';
  let token2ContractAddress = '';
  let token1Order1: Order;
  let token1Order2: Order;
  let token2Order1: Order;

  beforeAll(async () => {
    const { contract } = await deployTestToken(offerer);
    await contract.safeMint(offerer.address);
    await contract.safeMint(offerer.address);
    token1ContractAddress = contract.address;

    const { contract: contract2 } = await deployTestToken(offerer);
    await contract2.safeMint(offerer.address);
    token2ContractAddress = contract2.address;

    token1Order1 = await createOrder(sdk, contract, '0', '2000000', offerer, provider);
    token1Order2 = await createOrder(sdk, contract, '1', '1000000', offerer, provider);
    token2Order1 = await createOrder(sdk, contract2, '0', '1000000', offerer, provider);
  }, 90_000);

  it('should list orders by collection', async () => {
    const ordersPage = await sdk.listOrders({
      sellItemContractAddress: token1ContractAddress,
      status: OrderStatus.ACTIVE,
    });

    expect(ordersPage.result.length).toBe(2);
    expect(ordersPage.result[0].id).toEqual(token1Order2.id);
    expect(ordersPage.result[1].id).toEqual(token1Order1.id);
    expect(ordersPage.page?.next_cursor).toBeNull();
    expect(ordersPage.page?.previous_cursor).toBeNull();
  });

  it('should list orders by tokenID', async () => {
    const ordersPage = await sdk.listOrders({
      sellItemContractAddress: token2ContractAddress,
      sellItemTokenId: '0',
      status: OrderStatus.ACTIVE,
    });

    expect(ordersPage.result.length).toBe(1);
    expect(ordersPage.result[0].id).toEqual(token2Order1.id);
    expect(ordersPage.page?.next_cursor).toBeNull();
    expect(ordersPage.page?.previous_cursor).toBeNull();
  });

  it('should sort orders by buy amount', async () => {
    const ordersPage = await sdk.listOrders({
      sellItemContractAddress: token1ContractAddress,
      status: OrderStatus.ACTIVE,
      sortBy: 'buy_item_amount',
    });

    expect(ordersPage.result.length).toBe(2);
    expect(ordersPage.result[0].id).toEqual(token1Order1.id);
    expect(ordersPage.result[1].id).toEqual(token1Order2.id);
    expect(ordersPage.page?.next_cursor).toBeNull();
    expect(ordersPage.page?.previous_cursor).toBeNull();
  });

  it('should page orders', async () => {
    const ordersPage1 = await sdk.listOrders({
      sellItemContractAddress: token1ContractAddress,
      status: OrderStatus.ACTIVE,
      pageSize: 1,
    });

    expect(ordersPage1.result.length).toBe(1);
    expect(ordersPage1.result[0].id).toEqual(token1Order2.id);
    expect(ordersPage1.page?.next_cursor).toBeTruthy();
    expect(ordersPage1.page?.previous_cursor).toBeNull();

    const ordersPage2 = await sdk.listOrders({
      sellItemContractAddress: token1ContractAddress,
      status: OrderStatus.ACTIVE,
      pageSize: 1,
      pageCursor: ordersPage1.page!.next_cursor!,
    });

    expect(ordersPage2.result.length).toBe(1);
    expect(ordersPage2.result[0].id).toEqual(token1Order1.id);
    expect(ordersPage2.page?.next_cursor).toBeTruthy();
    expect(ordersPage2.page?.previous_cursor).toBeTruthy();

    const ordersPage3 = await sdk.listOrders({
      sellItemContractAddress: token1ContractAddress,
      status: OrderStatus.ACTIVE,
      pageSize: 1,
      pageCursor: ordersPage2.page!.next_cursor!,
    });

    expect(ordersPage3.result.length).toBe(0);
    expect(ordersPage3.page?.next_cursor).toBeNull();
    expect(ordersPage3.page?.previous_cursor).toBeNull();
  });
});
