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
        apiEndpoint: localConfigOverrides.apiEndpoint,
        chainName: localConfigOverrides.chainName,
        jsonRpcProviderUrl: localConfigOverrides.jsonRpcProviderUrl,
        seaportContractAddress: localConfigOverrides.seaportContractAddress,
        zoneContractAddress: localConfigOverrides.zoneContractAddress,
      },
    });

    const { contract } = await deployTestToken(offerer);
    await contract.safeMint(offerer.address);
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
        {
          buy: {
            amount: '2000000',
            type: 'NATIVE',
          },
          sell: {
            contractAddress: contract.address,
            tokenId: '1',
            type: 'ERC721',
          },
        },
      ],
    });

    const signatures = await actionAll(bulkListings.actions, offerer);

    const res = await sdk.createBulkListings({
      bulkOrderSignature: signatures[0],
      createOrderParams: bulkListings.preparedOrders.map((preparedOrder) => ({
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
});
