import { log } from 'console';
import { Environment } from '@imtbl/config';
import { OrderStatusName } from '../openapi/sdk';
import { Orderbook } from '../orderbook';
import {
  deployTestToken,
  getFulfillerWallet,
  getOffererWallet,
  getLocalhostProvider,
  waitForOrderToBeOfStatus,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getConfigFromEnv,
  TestERC721Token,
  getRandomTokenId,
} from './helpers';
import { actionAll } from './helpers/actions';
import { Wallet } from 'ethers';
import { JsonRpcProvider } from 'ethers';

async function deployAndMintNftContract(wallet: Wallet, provider: JsonRpcProvider): Promise<TestERC721Token> {
  log(await provider.getTransactionCount(wallet.address));
  const { contract } = await deployTestToken(wallet);
  log('contract deployed');
  const receipt = await contract.safeMint(wallet.address, getRandomTokenId(), {
    maxFeePerGas: BigInt(102e9),
    maxPriorityFeePerGas: BigInt(101e9),
  });
  await receipt.wait();
  log('token minted');
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
    const provider = getLocalhostProvider();
    const offerer = getOffererWallet(provider);
    const fulfiller = getFulfillerWallet(provider);

    log('Deploying a new NFT collection and minting a token...');
    // Deploy an NFT contract and mint a token for the offerer
    const nftContract = await deployAndMintNftContract(offerer, provider);

    const nftAddress = await nftContract.getAddress();

    // uncomment the overrides and set variables in
    // .env to run on environments other than testnet (e.g. devnet)
    // const configOverrides = getConfigFromEnv();
    const sdk = new Orderbook({
      baseConfig: {
        environment: Environment.SANDBOX,
      },
      overrides: {
        // ...configOverrides,
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
        contractAddress: nftAddress,
        tokenId: '0',
        type: 'ERC721',
      },
      // long expiry
      orderExpiry: new Date(Date.now() + 1000000 * 30),
    });

    const signatures = await actionAll(validListing.actions, offerer);
    log('Creating new listing to be fulfilled...');

    // Submit the order creation request to the order book API
    const {
      result: { id: orderId2 },
    } = await sdk.createListing({
      orderComponents: validListing.orderComponents,
      orderHash: validListing.orderHash,
      orderSignature: signatures[0],
      makerFees: [{
        amount: '1',
        recipientAddress: offerer.address,
      }],
    });

    log(`Listing of ${orderId2} submitted to orderbook API`);
    await waitForOrderToBeOfStatus(sdk, orderId2, OrderStatusName.ACTIVE);
    log(`Listing ${orderId2} is now ACTIVE, fulfilling order...`);

    const { actions, expiration, order } = await sdk.fulfillOrder(
      orderId2,
      fulfiller.address,
      [{
        amount: '1',
        recipientAddress: offerer.address,
      }],
    );

    log(`Fulfilling listing ${order.id}, fulfillment transaction valid till ${expiration}`);

    await actionAll(actions, fulfiller);

    log(
      `Fulfilment transaction sent, waiting for listing ${orderId2} to become FILLED`,
    );

    await waitForOrderToBeOfStatus(sdk, orderId2, OrderStatusName.FILLED);
    log(`Listing ${orderId2} is now FILLED`);

    log('Listing all orders for the NFT collection');

    const listOfOrders = await sdk.listListings({
      sellItemContractAddress: nftAddress,
    });

    log(`List of orders for contract ${nftAddress}:`);
    log(JSON.stringify(listOfOrders, null, 2));
  }, 200_000);
});
