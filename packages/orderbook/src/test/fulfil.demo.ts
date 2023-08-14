import { Environment } from '@imtbl/config';
import { Wallet } from 'ethers';
import { log } from 'console';
import { TransactionType } from 'types';
import { OrderStatus } from '../openapi/sdk/index';
import { Orderbook } from '../orderbook';
import {
  deployTestToken,
  getFulfillerWallet,
  getOffererWallet,
  getLocalhostProvider,
  signAndSubmitTx,
  signMessage,
  TestToken,
  waitForOrderToBeOfStatus,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getConfigFromEnv,
} from './helpers';

async function deployAndMintNftContract(wallet: Wallet): Promise<TestToken> {
  const { contract } = await deployTestToken(wallet);
  log('contract deployed');
  const receipt = await contract.safeMint(wallet.address);
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
    const nftContract = await deployAndMintNftContract(offerer);

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
        contractAddress: nftContract.address,
        tokenId: '0',
        type: 'ERC721',
      },
      // long expiry
      orderExpiry: new Date(Date.now() + 1000000 * 30),
    });

    const approvalAction = validListing.actions.find((a) => a.transactionType === 'APPROVAL');
    if (!approvalAction) {
      throw new Error('No approval action found');
    }
    const unsignedApprovalTransaction = await approvalAction.buildTransaction();

    await signAndSubmitTx(
      unsignedApprovalTransaction,
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

    const { actions } = await sdk.fulfillOrder(
      orderId2,
      fulfiller.address,
    );

    // The approval action must be built and submitted before the fulfillment action,
    // if an approval is required
    const fulfillApprovalAction = actions.find(
      (a) => a.transactionType === TransactionType.APPROVAL,
    );
    const fulfillOrderAction = actions.find(
      (a) => a.transactionType === TransactionType.FULFILL_ORDER,
    );

    if (fulfillApprovalAction) {
      const unsignedFulfillApprovalTransaction = await fulfillApprovalAction.buildTransaction();
      await signAndSubmitTx(unsignedFulfillApprovalTransaction, fulfiller, provider);
    }

    if (fulfillOrderAction) {
      const unsignedFulfillmentTransaction = await fulfillOrderAction.buildTransaction();
      await signAndSubmitTx(unsignedFulfillmentTransaction, fulfiller, provider);
    }

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
