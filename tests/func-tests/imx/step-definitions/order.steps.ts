import { defineFeature, loadFeature } from 'jest-cucumber';
import { StepSharedState } from './stepSharedState';
import { Registration } from './registration';
import { Minting } from './minting';
import { Order } from './order';
import { Trading } from './api';
import { Transfer } from './transfer';

const feature = loadFeature('features/order.feature', { tagFilter: process.env.TAGS });

defineFeature(feature, (test) => {
  test('Create Sell Order without existing sell order', ({
    given,
    and,
    when,
    then,
  }) => {
    const sharedState = new StepSharedState();
    const registration = new Registration(sharedState);
    const minting = new Minting(sharedState);
    const order = new Order(sharedState);
    const trading = new Trading(sharedState);

    given(/^A new Eth wallet "(.*)"$/, async (addressVar) => {
      await registration.addNewWallet(addressVar);
    });

    and(/^"(.*)" is registered$/, async (addressVar) => {
      await registration.register(addressVar);
    });

    and(/^randomly L2 mint to "(.*)" of "(.*)"$/, async (addressVar, assetVar) => {
      await minting.l2Mint(addressVar, assetVar);
    });

    and(/^NFT "(.*)" should be available through api$/, async (nftVar) => {
      await minting.checkL2MintedAsset(nftVar);
    });

    when(
      /^"(.*)" creates sell order "(.*)" of "(.*)" NFT to sell for "(.*)" eth using v3 api$/,
      async (sellerVar, sellOrderVar, assetVar, ethVar) => {
        await order.createNFTSellOrder(sellerVar, sellOrderVar, assetVar, ethVar);
      },
    );

    then(/^api should show that order "(.*)" status is "(.*)"$/, async (orderVar, statusVar) => {
      await trading.checkOrderStatus(orderVar, statusVar);
    });
  }, 5 * 60 * 1000 /* 5 minutes */);
  test('Create Buy Order (V3) - Asset with sell order', ({
    given,
    and
  }) => {
    const sharedState = new StepSharedState();
    const registration = new Registration(sharedState);
    const minting = new Minting(sharedState);
    const transfer = new Transfer(sharedState);
    given(/^A new Eth wallet "(.*)"$/, async (addressVar) => {
      await registration.addNewWallet(addressVar);
    });

    and(/^"(.*)" is registered$/, async (addressVar) => {
      await registration.register(addressVar);
    });

    and(/^randomly L2 mint to "(.*)" of "(.*)"$/, async (addressVar, assetVar) => {
      await minting.l2Mint(addressVar, assetVar);
    });

    and(/^NFT "(.*)" should be available through api$/, async (nftVar) => {
      await minting.checkL2MintedAsset(nftVar);
    });
  
    and(/^A new Eth wallet "(.*)"$/, async (addressVar) => {
      await registration.addNewWallet(addressVar);
    });
  
    and(/^"(.*)" is registered$/, async (addressVar) => {
      await registration.register(addressVar);
    });
  
    and('banker is registered', async () => {
      await registration.registerBanker();
    });
  
    and(/^banker transfer "(.*)" eth to "(.*)"$/, async (ethVar,ownerVar) => {
      await transfer.transferFromBanker(ethVar,ownerVar);
    });
  },5 * 60 * 1000 /* 5 minutes */);
});
