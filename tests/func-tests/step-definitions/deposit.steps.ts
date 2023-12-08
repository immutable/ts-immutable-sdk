import { defineFeature, loadFeature } from 'jest-cucumber';
import { StepSharedState } from './stepSharedState';
import { DepositEth } from './deposit';

const feature = loadFeature('features/deposit.feature', { tagFilter: process.env.TAGS });

defineFeature(feature, (test) => {
  test('Deposit Eth', ({
    given,
    and,
    when,
    then,
  }) => {
    const sharedState = new StepSharedState();
    const depositETH = new DepositEth(sharedState);

    given(/^banker has at least "(.*)" eth balance on L1$/, async (l1EthBalanceVar) => {
      await depositETH.checkBankerL1Balance(l1EthBalanceVar);
    });

    and(/^banker has L2 balance of "(.*)"$/, async (l2EthBalanceVar) => {
      await depositETH.recordBankerBalance(l2EthBalanceVar);
    });

    when(/^banker deposits "(.*)" eth$/, async (l2EthDepositVar) => {
      await depositETH.bankerDepositEth(l2EthDepositVar);
    });

    then(/^banker should have balance "(.*)" increased by "(.*)" eth$/, async (l2EthBalanceVar, l2EthIncreaseVar) => {
      await depositETH.accountBalanceShouldEqual(l2EthBalanceVar, l2EthIncreaseVar);
    });
  }, 60 * 10 * 1000 /* 10 minutes */);
});
