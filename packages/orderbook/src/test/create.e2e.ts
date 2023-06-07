import { Environment } from '@imtbl/config';
import { OrderStatus } from 'openapi/sdk';
import { Orderbook } from 'orderbook';
import { getLocalhostProvider } from './helpers/provider';
import { getConfig } from './helpers/config';
import { getOffererWallet } from './helpers/signers';
import { deployTestToken } from './helpers/erc721';
import { signAndSubmitTx, signMessage } from './helpers/sign-and-submit';
import { waitForOrderToBeOfStatus } from './helpers/order';

describe('prepareListing and createOrder e2e', () => {
  it('should create the order', async () => {
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
        chainId: 'eip155:31337',
      },
    });

    const { contract } = await deployTestToken(offerer);
    await contract.safeMint(offerer.address);

    const listing = await sdk.prepareListing({
      offerer: offerer.address,
      considerationItem: {
        amount: '1000000',
        type: 'IMX',
      },
      listingItem: {
        contractAddress: contract.address,
        tokenId: '0',
        type: 'ERC721',
      },
    });

    await signAndSubmitTx(listing.unsignedApprovalTransaction!, offerer, provider);
    const signature = await signMessage(
      listing.typedOrderMessageForSigning.domain,
      listing.typedOrderMessageForSigning.types,
      listing.typedOrderMessageForSigning.value,
      offerer,
    );

    const { result: { id: orderId } } = await sdk.createOrder({
      offerer: offerer.address,
      orderComponents: listing.orderComponents,
      orderHash: listing.orderHash,
      orderSignature: signature,
    });

    await waitForOrderToBeOfStatus(sdk, orderId, OrderStatus.ACTIVE);
  }, 30_000);
});
