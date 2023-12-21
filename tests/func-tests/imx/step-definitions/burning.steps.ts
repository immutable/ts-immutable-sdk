import { defineFeature, loadFeature } from "jest-cucumber";
import { StepSharedState } from "./stepSharedState";
import { Registration } from "./registration";
import { Minting } from "./minting";
import { Order } from "./order";
import { Trading } from "./api";
import { Burning } from "./burning";

const feature = loadFeature('features/burning.feature', { tagFilter: process.env.TAGS });

defineFeature(feature, test => {
  test('Burning', ({
    given,
    and,
    when,
    then
  }) => {
    const sharedState = new StepSharedState();
    const registration = new Registration(sharedState);
    const minting = new Minting(sharedState);
    const burning = new Burning(sharedState);
    const order = new Order(sharedState);
    const trading = new Trading(sharedState);

    given(/^A new Eth wallet "(.*)"$/, async (addressVar) => {
      await registration.addNewWallet(addressVar);
    });

    and(/^"(.*)" is registered$/, async (addressVar) => {
      await registration.register(addressVar);
    });

    and(/^randomly L2 minted to "(.*)" of "(.*)"$/, async (addressVar, assetVar) => {
      await minting.l2Mint(addressVar, assetVar);
    });

    and(/^NFT "(.*)" should be available through api$/, async (nftVar) => {
      await minting.checkL2MintedAsset(nftVar);
    });

    when(/^"(.*)" creates burn "(.*)" of "(.*)" NFT to burn address$/, async (userVar, burnVar, mintedVar) => {
      await burning.burnNFT(userVar, burnVar, mintedVar);
    });

    then(/^burn "(.*)" should be available through api$/, async (burnVar) => {
      await trading.checkBurn(burnVar);
    });

    and(/^api should show that NFT "(.*)" status is "(.*)"$/, async (mintedVar,statusVar) => {
      await trading.checkAssetStatus(mintedVar,statusVar);
    });
  },5 * 60 * 1000 /* 5 minutes */);
});