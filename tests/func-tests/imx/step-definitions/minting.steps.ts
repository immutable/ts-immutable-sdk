import { defineFeature, loadFeature } from "jest-cucumber";
import { StepSharedState } from "./stepSharedState";
import { Registration } from "./registration";
import { Minting } from "./minting";

const feature = loadFeature('features/minting.feature', { tagFilter: process.env.TAGS });

defineFeature(feature, test => {
  test('Minting', ({
    given,
    and,
    then,
    when
  }) => {
    const sharedState = new StepSharedState();
    const registration = new Registration(sharedState);
    const minting = new Minting(sharedState);

    given(/^A new Eth wallet "(.*)"$/, async (addressVar) => {
      await registration.addNewWallet(addressVar);
    });

    and(/^"(.*)" is registered$/, async (addressVar) => {
      await registration.register(addressVar);
    });


    then(/^user "(.*)" should be available through api$/, async (addressVar) => {
      await registration.checkUserRegistrationOffchain(addressVar);
    });

    when(/^randomly L2 mint to "(.*)" of "(.*)"$/, async (addressVar, assetVar) => {
      await minting.l2Mint(addressVar, assetVar);
    });

    and(/^NFT "(.*)" should be available through api$/, async (nftVar) => {
      await minting.checkL2MintedAsset(nftVar);
    });
  },5*60*1000 /* 5 minutes */);
});