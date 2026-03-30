import { defineFeature, loadFeature } from "jest-cucumber";
import { StepSharedState } from "./stepSharedState";
import { Registration } from "./registration";
import { DepositEth } from "./deposit";
import { Transfer } from "./transfer";
import { Trading } from "./api";

const feature = loadFeature('features/transfer.feature', { tagFilter: process.env.TAGS });

defineFeature(feature, test => {
  test('Transfer ETH', ({
    given,
    and,
    when,
    then
  }) => {
    const sharedState = new StepSharedState();
    const registration = new Registration(sharedState);
    const depositETH = new DepositEth(sharedState);
    const transfer = new Transfer(sharedState);
    const trading = new Trading(sharedState);
    given(/^A new Eth wallet "(.*)"$/, async (addressVar) => {
      await registration.addNewWallet(addressVar);
    });
    and(/^A new Eth wallet "(.*)"$/, async (addressVar) => {
      await registration.addNewWallet(addressVar);
    });
    and(/^"(.*)" is registered$/, async (addressVar) => {
      await registration.register(addressVar);
    });
    and(/^"(.*)" is registered$/, async (addressVar) => {
      await registration.register(addressVar);
    });
    and('banker is registered', async () => {
      await registration.registerBanker();
    });
    and(/^banker has L2 balance "(.*)" of at least "(.*)"$/, async (l2EthBalanceVar, minL2EthBalanceVar) => {
      await depositETH.checkBankerBalance(l2EthBalanceVar, minL2EthBalanceVar);
    });
    and(/^banker transfer "(.*)" eth to "(.*)"$/, async (ethVar,ownerVar) => {
      await transfer.transferFromBanker(ethVar,ownerVar);
    });

    when(/^"(.*)" creates transfer "(.*)" of "(.*)" ETH to "(.*)"$/, async (ownerVar,transferVar,ethVar,receiverVar) => {
      await transfer.transferETH(ownerVar,transferVar,ethVar,receiverVar);
    });

    then(/^transfer "(.*)" should be available through api$/, async(transferIdVar) => {
      await trading.checkTransfer(transferIdVar);
    });

    and(/^api should show that "(.*)" balance is "(.*)" ETH$/, async (userVar,amountVar) => {
      await trading.checkUserBalance(userVar,amountVar);
    });

    and(/^"(.*)" transfer "(.*)" eth to banker$/, async (userVar,ethVar) => {
      await transfer.transferToBanker(userVar,ethVar);
    });
  },5 * 60 * 1000 /* 5 minutes */);
});