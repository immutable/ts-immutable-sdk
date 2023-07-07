import { Environment } from '@imtbl/config';
import { Wallet } from 'ethers';
import { log } from 'console';
import { OrderStatus } from '../openapi/sdk/index';
import { Orderbook } from '../orderbook';
import {
  getLocalhostProvider,
  getConfig,
  getFulfillerWallet,
  getOffererWallet,
  deployTestToken,
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
    const config = getConfig();
    const provider = getLocalhostProvider();
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
      provider: getLocalhostProvider(),
      seaportContractAddress: config.seaportContractAddress,
      zoneContractAddress: config.zoneContractAddress,
      overrides: {
        apiEndpoint: config.apiUrl,
        chainName: 'imtbl-zkevm-devnet',
      },
    });

    log(`Preparing soon-to-expire listing for user ${offerer.address} for NFT collection ${nftContract.address}, TokenID 0`);

    // Prepare the listing details
    const soonToExpireListing = await sdk.prepareListing({
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
      orderExpiry: new Date(Date.now() + 1000 * 30),
    });

    log('Signing and submitting approval transaction...');
    // Sign and submit the approval transaction for the offerer
    await signAndSubmitTx(soonToExpireListing.unsignedApprovalTransaction!, offerer, provider);

    // Sign the EIP712 order message for the offerer. This is the signature that the order book API
    // stores and allows the fulfiller to fulfil the order, as long as they also have a valid
    // operator signature
    const signature = await signMessage(soonToExpireListing.typedOrderMessageForSigning, offerer);

    log('Submitting order to orderbook API...');
    // Submit the order creation request to the order book API
    const { result: { id: orderId } } = await sdk.createListing({
      orderComponents: soonToExpireListing.orderComponents,
      orderHash: soonToExpireListing.orderHash,
      orderSignature: signature,
    });
    log('Submitted order to orderbook API with expiry time set in the future');

    await waitForOrderToBeOfStatus(sdk, orderId, OrderStatus.ACTIVE);
    log(`Listing ${orderId} is now ACTIVE, it will soon transition to EXPIRED, waiting...`);

    await waitForOrderToBeOfStatus(sdk, orderId, OrderStatus.EXPIRED);
    log(`Listing ${orderId} is now EXPIRED. Attempting to fulfill the expired listing...`);

    try {
      await sdk.fulfillOrder(orderId, fulfiller.address);
    } catch (e) {
      log('Fulfillment failed as expected. The error is:');
      log(e);
    }

    log('Listing all orders for the NFT collection');

    const listOfOrders = await sdk.listListings({
      sellItemContractAddress: nftContract.address,
    });

    log(`List of orders for contract ${nftContract.address}:`);
    log(JSON.stringify(listOfOrders, null, 2));
  }, 200_000);
});
