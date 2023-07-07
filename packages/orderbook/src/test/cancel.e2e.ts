import { Environment } from '@imtbl/config';
import { OrderStatus } from 'openapi/sdk';
import { Orderbook } from 'orderbook';
import { getLocalhostProvider } from './helpers/provider';
import { getConfig } from './helpers/config';
import { getOffererWallet } from './helpers/signers';
import { deployTestToken } from './helpers/erc721';
import { signAndSubmitTx, signMessage } from './helpers/sign-and-submit';
import { waitForOrderToBeOfStatus } from './helpers/order';

describe('cancel order', () => {
  it('should cancel the order', async () => {
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

    const { unsignedCancelOrderTransaction } = await sdk.cancelOrder(
      orderId,
      offerer.address,
    );
    await signAndSubmitTx(unsignedCancelOrderTransaction, offerer, provider);

    await waitForOrderToBeOfStatus(sdk, orderId, OrderStatus.CANCELLED);
  }, 60_000);
});
