import { log } from 'console';
import { Environment } from '@imtbl/config';
import { Wallet } from 'ethers';
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
import { GAS_OVERRIDES } from './helpers/gas';

async function deployAndMintNftContract(wallet: Wallet, count?: number): Promise<TestERC721Token> {
  const { contract } = await deployTestToken(wallet);
  log('contract deployed');
  if (count) {
    for (let i = 0; i < count; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const receipt = await contract.safeMint(wallet.address, getRandomTokenId(), GAS_OVERRIDES);
      // eslint-disable-next-line no-await-in-loop
      await receipt.wait();
      log('token minted');
    }
  }
  return contract;
}

// Just using Jest for ease of executing the demo script, not test syntax used
describe('', () => {
  it('', async () => {
    const provider = getLocalhostProvider();
    const offerer = getOffererWallet(provider);
    const fulfiller = getFulfillerWallet(provider);
    const newFulfiller = Wallet.createRandom().connect(provider);

    log('Deploying a new NFT collection and minting a token...');
    // Deploy an NFT contract and mint a token for the offerer
    const nftContract = await deployAndMintNftContract(offerer, 2);

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
    const validListing1 = await sdk.prepareListing({
      makerAddress: offerer.address,
      buy: {
        amount: '100000',
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

    const validListing2 = await sdk.prepareListing({
      makerAddress: offerer.address,
      buy: {
        amount: '100000',
        type: 'NATIVE',
      },
      sell: {
        contractAddress: nftAddress,
        tokenId: '1',
        type: 'ERC721',
      },
      // long expiry
      orderExpiry: new Date(Date.now() + 1000000 * 30),
    });

    const signatures1 = await actionAll(validListing1.actions, offerer);
    const signatures2 = await actionAll(validListing2.actions, offerer);
    log('Creating new listing to be fulfilled...');

    // Submit the order creation request to the order book API
    const {
      result: { id: orderId1 },
    } = await sdk.createListing({
      orderComponents: validListing1.orderComponents,
      orderHash: validListing1.orderHash,
      orderSignature: signatures1[0],
      makerFees: [{
        amount: '1',
        recipientAddress: offerer.address,
      }],
    });

    const {
      result: { id: orderId2 },
    } = await sdk.createListing({
      orderComponents: validListing2.orderComponents,
      orderHash: validListing2.orderHash,
      orderSignature: signatures2[0],
      makerFees: [{
        amount: '1',
        recipientAddress: offerer.address,
      }],
    });

    await waitForOrderToBeOfStatus(sdk, orderId1, OrderStatusName.ACTIVE);
    await waitForOrderToBeOfStatus(sdk, orderId2, OrderStatusName.ACTIVE);
    log(`Listings ${orderId1} and ${orderId2} is now ACTIVE, fulfilling order...`);

    const fulfillResponse1 = await sdk.fulfillBulkOrders(
      [
        {
          listingId: orderId1,
          takerFees: [{
            amount: '1',
            recipientAddress: offerer.address,
          }],
        },
        {
          listingId: orderId2,
          takerFees: [{
            amount: '1',
            recipientAddress: offerer.address,
          }],
        },
      ],
      newFulfiller.address,
    );

    log(`Fulfilling listing without sufficient balance - fulfill response ${JSON.stringify(fulfillResponse1)}`);
    // assert the insufficient balance flag is correctly set
    if (fulfillResponse1.sufficientBalance) {
      throw new Error('Insufficient balance fulfillment request response had sufficient balance');
    }

    const fulfillResponse = await sdk.fulfillBulkOrders(
      [
        {
          listingId: orderId1,
          takerFees: [{
            amount: '1',
            recipientAddress: offerer.address,
          }],
        },
        {
          listingId: orderId2,
          takerFees: [{
            amount: '1',
            recipientAddress: offerer.address,
          }],
        },
      ],
      fulfiller.address,
    );

    if (fulfillResponse.sufficientBalance) {
      const { fulfillableOrders, expiration, actions } = fulfillResponse;

      log(`Fulfilling listings ${fulfillableOrders[0].id}, ${fulfillableOrders[1].id} fulfillment transaction valid till ${expiration}`);

      await actionAll(actions, fulfiller);

      log(
        `Fulfilment transaction sent, waiting for listing ${orderId2} to become FILLED`,
      );

      await waitForOrderToBeOfStatus(sdk, orderId1, OrderStatusName.FILLED);
      await waitForOrderToBeOfStatus(sdk, orderId2, OrderStatusName.FILLED);
      log('Listings are now FILLED');

      log('Listing all orders for the NFT collection');

      const listOfOrders = await sdk.listListings({
        sellItemContractAddress: nftAddress,
      });

      log(`List of orders for contract ${nftAddress}:`);
      log(JSON.stringify(listOfOrders, null, 2));
    }
  }, 200_000);
});
