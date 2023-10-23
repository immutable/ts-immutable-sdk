import { Environment } from '@imtbl/config';
import { OrderStatusName } from 'openapi/sdk';
import { Orderbook } from 'orderbook';
import { getLocalhostProvider } from './helpers/provider';
import { getOffererWallet } from './helpers/signers';
import { deployTestToken } from './helpers/erc721';
import { signAndSubmitTx } from './helpers/sign-and-submit';
import { waitForOrderToBeOfStatus } from './helpers/order';
import { getConfigFromEnv } from './helpers';
import { actionAll } from './helpers/actions';

describe('cancel order', () => {
  it('should cancel the order', async () => {
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

    const listing = await sdk.prepareListing({
      makerAddress: offerer.address,
      buy: {
        amount: '1000000',
        type: 'NATIVE',
      },
      sell: {
        contractAddress: contract.address,
        tokenId: '0',
        type: 'ERC721',
      },
    });

    const signatures = await actionAll(listing.actions, offerer, provider);

    const {
      result: { id: orderId },
    } = await sdk.createListing({
      orderComponents: listing.orderComponents,
      orderHash: listing.orderHash,
      orderSignature: signatures[0],
      makerFees: [],
    });

    await waitForOrderToBeOfStatus(sdk, orderId, OrderStatusName.ACTIVE);

    const { unsignedCancelOrderTransaction } = await sdk.cancelOrder(
      orderId,
      offerer.address,
    );
    await signAndSubmitTx(unsignedCancelOrderTransaction, offerer, provider);

    await waitForOrderToBeOfStatus(sdk, orderId, OrderStatusName.CANCELLED);
  }, 60_000);
});
