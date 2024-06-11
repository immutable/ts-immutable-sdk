/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { Environment } from '@imtbl/config';
import { OrderStatusName } from 'openapi/sdk';
import { Orderbook } from 'orderbook';
import { getLocalhostProvider } from './helpers/provider';
import { getOffererWallet } from './helpers/signers';
import { deployTestToken } from './helpers/erc721';
import { waitForOrderToBeOfStatus } from './helpers/order';
import { getConfigFromEnv } from './helpers';
import { actionAll } from './helpers/actions';
import { PrepareBulkListingsParams } from '../types';

describe('prepareListing and createOrder bulk e2e', () => {
  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])('should create %d listings', async (numberOfListings) => {
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

    // Build the order params while minting the tokens
    const orderParams: PrepareBulkListingsParams['listingParams'] = [];
    let i = 0;
    while (i < numberOfListings) {
      await contract.safeMint(offerer.address);

      orderParams.push({
        buy: {
          amount: '1000000',
          type: 'NATIVE',
        },
        sell: {
          contractAddress: contract.address,
          tokenId: `${i}`,
          type: 'ERC721',
        },
      });
      // eslint-disable-next-line no-plusplus
      i++;
    }

    await contract.safeMint(offerer.address);

    const bulkListings = await sdk.prepareBulkListings({
      makerAddress: offerer.address,
      listingParams: orderParams,
    });

    const signatures = await actionAll(bulkListings.actions, offerer);

    const res = await sdk.createBulkListings({
      bulkOrderSignature: signatures[0],
      listingParams: bulkListings.preparedListings.map((preparedOrder) => ({
        makerFees: [],
        orderComponents: preparedOrder.orderComponents,
        orderHash: preparedOrder.orderHash,
      })),
    });

    for (const result of res.result) {
      if (!result.order) {
        throw new Error('Order not created');
      }
      await waitForOrderToBeOfStatus(sdk, result.order.id, OrderStatusName.ACTIVE);
    }
  }, 30_000);

  it('should create fail to prepare more than 10 listings', async () => {
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

    // Build the order params while minting the tokens
    const orderParams: PrepareBulkListingsParams['listingParams'] = [];
    let i = 0;
    const tooManyListings = 11;
    while (i < tooManyListings) {
      await contract.safeMint(offerer.address);

      orderParams.push({
        buy: {
          amount: '1000000',
          type: 'NATIVE',
        },
        sell: {
          contractAddress: contract.address,
          tokenId: `${i}`,
          type: 'ERC721',
        },
      });
      // eslint-disable-next-line no-plusplus
      i++;
    }

    await contract.safeMint(offerer.address);

    await expect(sdk.prepareBulkListings({
      makerAddress: offerer.address,
      listingParams: orderParams,
    })).rejects.toEqual(new Error('Bulk listing creation is limited to 10 orders'));
  });
});
