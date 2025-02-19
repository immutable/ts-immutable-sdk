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

describe('prepareListing and createOrder e2e', () => {
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
    await contract.safeMint(offerer.address, getRandomTokenId());

    const listing = await sdk.prepareListing({
      makerAddress: offerer.address,
      buy: {
        amount: '1000000',
        type: 'NATIVE',
      },
      sell: {
        contractAddress: await contract.getAddress(),
        tokenId: '0',
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
  }, 30_000);
});
