import { Wallet } from 'ethers';
import { Environment } from '@imtbl/config';
import { OrderStatusName } from '../openapi/sdk';
import { Orderbook } from '../orderbook';
import { getLocalhostProvider } from './helpers/provider';
import { getOffererWallet } from './helpers/signers';
import { deployTestToken } from './helpers/erc721';
import { waitForOrderToBeOfStatus } from './helpers/order';
import { getConfigFromEnv, getRandomTokenId } from './helpers';
import { actionAll } from './helpers/actions';
import { GAS_OVERRIDES } from './helpers/gas';

async function createOrder(
  sdk: Orderbook,
  offerer: Wallet,
  tokenAddress: string,
  tokenId: string,
): Promise<string> {
  const listing = await sdk.prepareListing({
    makerAddress: offerer.address,
    buy: {
      amount: '1000000',
      type: 'NATIVE',
    },
    sell: {
      contractAddress: tokenAddress,
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

  await waitForOrderToBeOfStatus(sdk, orderId, OrderStatusName.ACTIVE);

  return orderId;
}

describe('cancel order', () => {
  it('should cancel orders on-chain', async () => {
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

    const { contract } = await deployTestToken(offerer);

    const receipt = await contract.safeMint(offerer.address, getRandomTokenId(), GAS_OVERRIDES);
    await receipt.wait();
    const orderId1 = await createOrder(sdk, offerer, await contract.getAddress(), '0');

    const receipt2 = await contract.safeMint(offerer.address, getRandomTokenId(), GAS_OVERRIDES);
    await receipt2.wait();
    const orderId2 = await createOrder(sdk, offerer, await contract.getAddress(), '1');

    const { cancellationAction } = await sdk.cancelOrdersOnChain(
      [orderId1, orderId2],
      offerer.address,
    );
    await actionAll([cancellationAction], offerer);

    await waitForOrderToBeOfStatus(sdk, orderId1, OrderStatusName.CANCELLED);
    await waitForOrderToBeOfStatus(sdk, orderId2, OrderStatusName.CANCELLED);
  }, 60_000);

  it('should cancel orders off-chain', async () => {
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

    const { contract } = await deployTestToken(offerer);

    const receipt = await contract.safeMint(offerer.address, getRandomTokenId(), GAS_OVERRIDES);
    await receipt.wait();
    const orderId1 = await createOrder(sdk, offerer, await contract.getAddress(), '0');

    const receipt2 = await contract.safeMint(offerer.address, getRandomTokenId(), GAS_OVERRIDES);
    await receipt2.wait();
    const orderId2 = await createOrder(sdk, offerer, await contract.getAddress(), '1');

    const { signableAction } = await sdk.prepareOrderCancellations(
      [orderId1, orderId2],
    );

    const signatures = await actionAll([signableAction], offerer);

    await sdk.cancelOrders([orderId1, orderId2], offerer.address, signatures[0]);

    await waitForOrderToBeOfStatus(sdk, orderId1, OrderStatusName.CANCELLED);
    await waitForOrderToBeOfStatus(sdk, orderId2, OrderStatusName.CANCELLED);
  }, 60_000);
});
