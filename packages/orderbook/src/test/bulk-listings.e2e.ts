/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { Environment } from '@imtbl/config';
import { OrderStatusName } from '../openapi/sdk';
import { Orderbook } from '../orderbook';
import { getLocalhostProvider } from './helpers/provider';
import { getOffererWallet } from './helpers/signers';
import { deployTestToken } from './helpers/erc721';
import { waitForOrderToBeOfStatus } from './helpers/order';
import { getConfigFromEnv, getRandomTokenId } from './helpers';
import { actionAll } from './helpers/actions';
import { PrepareBulkListingsParams } from '../types';
import { GAS_OVERRIDES } from './helpers/gas';

// An array of each number between 1 and 20
const supportedListings = Array.from({ length: 20 }, (_, i) => i + 1);

describe('prepareListing and createOrder bulk e2e', () => {
  it.each(supportedListings)('should create %d listings', async (numberOfListings) => {
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
      await contract.safeMint(offerer.address, getRandomTokenId(), GAS_OVERRIDES);

      orderParams.push({
        buy: {
          amount: '1000000',
          type: 'NATIVE',
        },
        sell: {
          contractAddress: await contract.getAddress(),
          tokenId: `${i}`,
          type: 'ERC721',
        },
        makerFees: [{
          amount: '10000',
          recipientAddress: offerer.address,
        }],
      });
      // eslint-disable-next-line no-plusplus
      i++;
    }

    await contract.safeMint(offerer.address, getRandomTokenId(), GAS_OVERRIDES);

    const { actions, completeListings } = await sdk.prepareBulkListings({
      makerAddress: offerer.address,
      listingParams: orderParams,
    });

    const bulkOrderSignatures = await actionAll(actions, offerer);
    const res = await completeListings(bulkOrderSignatures);

    for (const result of res.result) {
      if (!result.order) {
        throw new Error('Order not created');
      }
      await waitForOrderToBeOfStatus(sdk, result.order.id, OrderStatusName.ACTIVE);
    }
  }, 60_000);

  it('should create fail to prepare more than 20 listings', async () => {
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
    const tooManyListings = 21;
    while (i < tooManyListings) {
      await contract.safeMint(offerer.address, getRandomTokenId(), GAS_OVERRIDES);

      orderParams.push({
        buy: {
          amount: '1000000',
          type: 'NATIVE',
        },
        sell: {
          contractAddress: await contract.getAddress(),
          tokenId: `${i}`,
          type: 'ERC721',
        },
        makerFees: [],
      });
      // eslint-disable-next-line no-plusplus
      i++;
    }

    await contract.safeMint(offerer.address, getRandomTokenId(), GAS_OVERRIDES);

    await expect(sdk.prepareBulkListings({
      makerAddress: offerer.address,
      listingParams: orderParams,
    })).rejects.toEqual(new Error('Bulk listing creation is limited to 20 orders'));
  }, 60_000);
});
