import { strict as assert } from 'assert';
import { parseUnits } from '@ethersproject/units';
import { config, orderbook } from '@imtbl/sdk';

import { SharedState } from './shared-state';
import { repeatCheck } from '../lib/utils';

import {
  actionAll,
  waitForOrderToBeOfStatus,
} from '../lib/orderbook';

export class Sale {
  private orderbook: orderbook.Orderbook;
  constructor(protected sharedState: SharedState) {
    this.orderbook = new orderbook.Orderbook({
      baseConfig: {
        environment: config.Environment.SANDBOX,
      },
      overrides: {
        provider: sharedState.provider,
        seaportContractAddress: '0xD66d6E2dbF68a3c9A50638782B352b3cd60D3f86',
        zoneContractAddress: '0xa1A3A3c7605ef51cCbC70A2df7E87cCEE2A77e9e',
        apiEndpoint: 'https://order-book-mr.dev.imtbl.com',
        chainName: 'imtbl-zkevm-devnet',
      },
    });
  }

  // @when('an order is fulfilled for {string} IMX', undefined, 120 * 1000)
  public async fulfilOrder(buyAmount: string) {
    const parsedBuyAmount = parseUnits(buyAmount, 18).toString();
    console.log('parsedBuyAmount', parsedBuyAmount);

    const { provider, seller, buyer } = this.sharedState;

    // Get NFTs owned by seller
    const sellersNFTs =
      await this.sharedState.blockchainData.listNFTsByAccountAddress({
        chainName: this.sharedState.chainName,
        accountAddress: seller.address,
        contractAddress: '0xb5a2485ca12e01431A2bE8934a41Ea35CB080d17',
      });

    // Sell the first NFT in the list
    const sellItem = sellersNFTs.result[0];

    console.log('sellItem: ', sellItem);

    // Prepare listing
    console.log('Signing and submitting approval transaction...');
    const prepareListingResponse = await this.orderbook.prepareListing({
      makerAddress: seller.address,
      buy: {
        amount: '1000000',
        type: 'NATIVE',
      },
      sell: {
        contractAddress: sellItem.contract_address,
        tokenId: sellItem.token_id,
        type: 'ERC721',
      },
      // long expiry
      orderExpiry: new Date(Date.now() + 1000000 * 30),
    });

    const signatures = await actionAll(
      prepareListingResponse.actions,
      seller,
      provider,
    );

    console.log('Cretaing new listing to be fulfilled...');

    // Submit the order creation request to the order book API
    const {
      result: { id: orderId2 },
    } = await this.orderbook.createListing({
      orderComponents: prepareListingResponse.orderComponents,
      orderHash: prepareListingResponse.orderHash,
      orderSignature: signatures[1],
      makerFees: [],
    });

    await waitForOrderToBeOfStatus(
      this.orderbook,
      orderId2,
      orderbook.OrderStatusName.ACTIVE,
    );
    console.log(`Listing ${orderId2} is now ACTIVE, fulfilling order...`);

    const { actions } = await this.orderbook.fulfillOrder(
      orderId2,
      buyer.address,
      [],
    );

    await actionAll(actions, buyer, provider);
    console.log(
      `Fulfilment transaction sent, waiting for listing ${orderId2} to become FILLED`,
    );

    await waitForOrderToBeOfStatus(
      this.orderbook,
      orderId2,
      orderbook.OrderStatusName.FILLED,
    );
    console.log(`Listing ${orderId2} is now FILLED`);

    console.log('Listing all orders for the NFT collection');

    const listOfOrders = await this.orderbook.listListings({
      sellItemContractAddress: sellItem.contract_address,
    });

    console.log(`List of orders for contract ${sellItem.contract_address}:`);
    console.log(JSON.stringify(listOfOrders, null, 2));

    this.sharedState.saleActivityParams = {
      contractAddress: sellItem.contract_address,
      tokenId: sellItem.token_id,
    };
  }

  // @then(
  //   'the fulfilled order is indexed as a sale activity',
  //   undefined,
  //   DEFAULT_TIMEOUT,
  // )
  public async checkSaleActivity() {
    const { chainName } = this.sharedState;
    await repeatCheck(60)(async () => {
      const activities = await this.sharedState.blockchainData.listActivities({
        chainName,
        contractAddress: this.sharedState.saleActivityParams?.contractAddress,
        tokenId: this.sharedState.saleActivityParams?.tokenId,
      });
      console.log(JSON.stringify(activities.result, null, 2));
      assert.ok(activities.result);
    });
  }

  // @then('sdk should list sale activities', undefined, 180 * DEFAULT_TIMEOUT)
  public async listSaleActivities() {
    const { chainName } = this.sharedState;
    await repeatCheck(60)(async () => {
      const activities = await this.sharedState.blockchainData.listActivities({
        chainName,
        activityType: 'sale',
      });
      assert.ok(activities.result);
      assert.ok(activities.result.length > 0);
      this.sharedState.saleActivityId = activities.result[0].id;
    });
  }

  // @then('sdk should fetch a sale activity', undefined, 180 * DEFAULT_TIMEOUT)
  public async getSaleActivity() {
    const { chainName, saleActivityId } = this.sharedState;
    assert.ok(saleActivityId !== null);

    await repeatCheck(60)(async () => {
      const activities = await this.sharedState.blockchainData.getActivity({
        chainName,
        activityId: saleActivityId,
      });
      assert.ok(activities.result);
    });
  }
}
