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

describe('prepareListing and createOrder bulk e2e', () => {
  it('should create the order', async () => {
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
    await contract.safeMint(offerer.address);

    const bulkListings = await sdk.prepareBulkListings({
      makerAddress: offerer.address,
      orderParams: [
        {
          buy: {
            amount: '1000000',
            type: 'NATIVE',
          },
          sell: {
            contractAddress: contract.address,
            tokenId: '0',
            type: 'ERC721',
          },
        },
      ],
    });

    const signatures = await actionAll(bulkListings.actions, offerer);
    console.log(JSON.stringify(bulkListings.preparedOrders, null, 2));

    const res = await sdk.createListing({
      orderComponents: bulkListings.preparedOrders[0].orderComponents,
      orderHash: bulkListings.preparedOrders[0].orderHash,
      orderSignature: signatures[0],
      makerFees: [],
    }).catch(e => {
      console.log(JSON.stringify(e, null, 2));
      throw e
    });

    // await waitForOrderToBeOfStatus(sdk, orderId, OrderStatusName.ACTIVE);
  }, 30_000);
});
