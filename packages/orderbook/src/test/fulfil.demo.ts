import { Environment } from '@imtbl/config';
import { Wallet, providers } from 'ethers';
import { log } from 'console';
import { OrderStatus } from '../openapi/sdk/index';
import { Orderbook } from '../orderbook';
import {
  deployTestToken,
  getFulfillerWallet,
  getOffererWallet,
  signAndSubmitTx,
  signMessage,
  TestToken,
  waitForOrderToBeOfStatus,
} from './helpers';

async function deployAndMintNftContract(wallet: Wallet): Promise<TestToken> {
  const { contract } = await deployTestToken(wallet);
  const receipt = await contract.safeMint(wallet.address);
  await receipt.wait();
  return contract;
}

/*
  Script:

  The new visibile features of the order book since the last demo are:
   - Interactions exposed through the SDK (plus docs)
   - Orders expire
   - Orders can be listed and paged
   - Order can be fulfiled
*/

// Just using Jest for ease of executing the demo script, not test syntax used
describe('', () => {
  it('', async () => {
    const provider = new providers.JsonRpcProvider(
      'https://zkevm-rpc.sandbox.x.immutable.com',
    );
    const offerer = getOffererWallet(provider);
    const fulfiller = getFulfillerWallet(provider);

    log('Deploying a new NFT collection and minting a token...');
    // Deploy an NFT contract and mint a token for the offerer
    const nftContract = await deployAndMintNftContract(offerer);

    // Instantiate the order book SDK. Once environments stabilise there will be default values so
    // that end users will just be able to do `new Orderbook()` in most cases
    const sdk = new Orderbook({
      baseConfig: {
        environment: Environment.SANDBOX,
      },

      overrides: {
        // Replace overrides with devnet values if needed
        // values can be found here https://immutable.atlassian.net/wiki/spaces/TRAD/pages/2192573143/zkEVM+orderbook+deployment+addresses
        provider,
      },
    });

    log('Signing and submitting approval transaction...');
    const validListing = await sdk.prepareListing({
      makerAddress: offerer.address,
      buy: {
        amount: '1000000',
        type: 'NATIVE',
      },
      sell: {
        contractAddress: nftContract.address,
        tokenId: '0',
        type: 'ERC721',
      },
      // long expiry
      orderExpiry: new Date(Date.now() + 1000000 * 30),
    });

    await signAndSubmitTx(
      validListing.unsignedApprovalTransaction!,
      offerer,
      provider,
    );

    const signature2 = await signMessage(
      validListing.typedOrderMessageForSigning,
      offerer,
    );

    log('Cretaing new listing to be fulfilled...');

    // Submit the order creation request to the order book API
    const {
      result: { id: orderId2 },
    } = await sdk.createListing({
      orderComponents: validListing.orderComponents,
      orderHash: validListing.orderHash,
      orderSignature: signature2,
    });

    await waitForOrderToBeOfStatus(sdk, orderId2, OrderStatus.ACTIVE);
    log(`Listing ${orderId2} is now ACTIVE, fulfilling order...`);

    const { unsignedFulfillmentTransaction } = await sdk.fulfillOrder(
      orderId2,
      fulfiller.address,
    );
    await signAndSubmitTx(unsignedFulfillmentTransaction, fulfiller, provider);
    log(
      `Fulfilment transaction sent, waiting for listing ${orderId2} to become FILLED`,
    );

    await waitForOrderToBeOfStatus(sdk, orderId2, OrderStatus.FILLED);
    log(`Listing ${orderId2} is now FILLED`);

    log('Listing all orders for the NFT collection');

    const listOfOrders = await sdk.listListings({
      sellItemContractAddress: nftContract.address,
    });

    log(`List of orders for contract ${nftContract.address}:`);
    log(JSON.stringify(listOfOrders, null, 2));
  }, 200_000);
});
