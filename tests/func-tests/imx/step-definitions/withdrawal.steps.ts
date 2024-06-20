import { defineFeature, loadFeature } from 'jest-cucumber';
import { Registration } from './registration';
import { StepSharedState } from './stepSharedState';
import { Withdrawal } from './withdrawal';
import { DepositEth } from './deposit';
import { Transfer } from './transfer';

const feature = loadFeature('features/withdrawal.feature', { tagFilter: process.env.TAGS });

defineFeature(feature, (test) => {
  test('Withdraw ETH', ({
    given,
    and,
    when,
    then,
  }) => {
    const sharedState = new StepSharedState();
    const registration = new Registration(sharedState);
    const withdrawal = new Withdrawal(sharedState);
    const depositETH = new DepositEth(sharedState);
    const transfer = new Transfer(sharedState);
    given(/^A new Eth wallet "(.*)"$/, async (addressVar) => {
      await registration.addNewWallet(addressVar, true);
    });
    and(/^"(.*)" is registered$/, async (addressVar) => {
      await registration.register(addressVar);
    });
    and('banker is registered', async () => {
      await registration.registerBanker();
    });

    and(/^banker has L2 balance "(.*)" of at least "(.*)"$/, async (bankerBalanceVar, ethBalanceVar) => {
      await depositETH.checkBankerBalance(bankerBalanceVar, ethBalanceVar);
    });

    and(/^banker transfer "(.*)" eth to "(.*)"$/, async (amountVar, addressVar) => {
      await transfer.transferFromBanker(amountVar, addressVar);
    });

    and(/^banker L1 ETH balance is at least "(.*)"$/, async (amountVar) => {
      await depositETH.checkBankerL1EthBalance(amountVar);
    });

    and(/^banker transfer "(.*)" eth to "(.*)" on L1$/, async (amountVar, addressVar) => {
      await transfer.transferL1EthFromBanker(amountVar, addressVar);
    });

    when(/^user "(.*)" prepare withdrawal "(.*)" of ETH "(.*)"$/, async (addressVar, withdrawalVar, ethVar) => {
      const response = await withdrawal.prepareEthWithdrawal(addressVar, withdrawalVar, ethVar);
      expect(response.withdrawal_id).toBeGreaterThan(0);
      // eslint-disable-next-line max-len
      console.log(`prepareEthWithdrawal transaction can be found here: https://sandbox.immutascan.io/tx/${response.withdrawal_id}`);
    });

    then(/^ETH withdrawal "(.*)" should be in "(.*)" status$/, async (withdrawalVar, statusVar) => {
      await withdrawal.checkWithdrawableEthStatus(withdrawalVar, statusVar);
    });
  });

  test('Complete withdraw ETH', ({ given, and, then }) => {
    const sharedState = new StepSharedState();
    const registration = new Registration(sharedState);
    const withdrawal = new Withdrawal(sharedState);
    given(/^A stored Eth wallet "(.*)"$/, async (addressVar) => {
      await registration.restoreUserWallet(addressVar);
    });
    and(/^"(.*)" is registered$/, async (addressVar) => {
      await registration.checkUserRegistrationOffchain(addressVar);
    });
    then(/^user "(.*)" completes withdrawal of ETH$/, async (addressVar) => {
      await withdrawal.completeEthWithdrawal(addressVar);
    });
  });
});
