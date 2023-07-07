import { Environment } from '@imtbl/config';
import { OrderStatus } from 'openapi/sdk';
import { Orderbook } from 'orderbook';
import { getLocalhostProvider } from './helpers/provider';
import { getConfig } from './helpers/config';
import { getFulfillerWallet, getOffererWallet } from './helpers/signers';
import { deployTestToken } from './helpers/erc721';
import { signAndSubmitTx, signMessage } from './helpers/sign-and-submit';
import { waitForOrderToBeOfStatus } from './helpers/order';

describe('fulfil order', () => {
  it('should fulfil the order', async () => {
    const config = getConfig();
    const provider = getLocalhostProvider();
    const offerer = getOffererWallet(provider);
    const fulfiller = getFulfillerWallet(provider);

    const sdk = new Orderbook({
      baseConfig: {
        environment: Environment.SANDBOX,
      },
      provider: getLocalhostProvider(),
      seaportContractAddress: config.seaportContractAddress,
      zoneContractAddress: config.zoneContractAddress,
      overrides: {
        apiEndpoint: config.apiUrl,
        chainName: 'imtbl-zkevm-local',
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

    await signAndSubmitTx(
      listing.unsignedApprovalTransaction!,
      offerer,
      provider,
    );
    const signature = await signMessage(
      listing.typedOrderMessageForSigning,
      offerer,
    );

    const {
      result: { id: orderId },
    } = await sdk.createListing({
      orderComponents: listing.orderComponents,
      orderHash: listing.orderHash,
      orderSignature: signature,
    });

    await waitForOrderToBeOfStatus(sdk, orderId, OrderStatus.ACTIVE);

    const { unsignedFulfillmentTransaction } = await sdk.fulfillOrder(
      orderId,
      fulfiller.address,
    );
    await signAndSubmitTx(unsignedFulfillmentTransaction, fulfiller, provider);

    await waitForOrderToBeOfStatus(sdk, orderId, OrderStatus.FILLED);
  }, 60_000);
});
