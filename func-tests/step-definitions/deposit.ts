import { strict as assert } from 'assert';
import { formatEther, parseEther } from '@ethersproject/units';
import { ImmutableX } from '@imtbl/core-sdk';
import { StepSharedState, configuration, oldConfig } from './stepSharedState';
import { repeatCheck600, waitForTransactionResponse } from '../common';

// @binding([StepSharedState])
export class DepositEth {
  constructor(protected stepSharedState: StepSharedState) {}

  client = new ImmutableX(oldConfig);

  // @when('banker deposits {string} eth', undefined, 120 * 1000)
  public async bankerDepositEth(amount: string) {
    // TODO: need to make sure this addressVar has ETH on L1 to deposit
    const banker = await this.stepSharedState.getBanker();

    const transactionResponse = await this.client.deposit(banker.ethSigner, {
      type: 'ETH',
      amount: parseEther(amount).toString(),
    });

    return await waitForTransactionResponse(transactionResponse);
  }

  // @given('banker has at least {string} eth balance on L1')
  public async checkBankerL1Balance(amount: string) {
    const banker = await this.stepSharedState.getBanker();
    const onChainBalance = await banker.ethSigner.getBalance();
    assert.ok(onChainBalance.gte(parseEther(amount)));
  }

  // @given('banker has L2 balance of {string}')
  public async recordBankerBalance(bankerBalanceVar: string) {
    const banker = await this.stepSharedState.getBanker();
    const ownerAddress = await banker.ethSigner.getAddress();
    const response = await this.client.getBalance({
      owner: ownerAddress,
      address: StepSharedState.getTokenAddress('ETH'),
    });
    this.stepSharedState.bankerBalances[bankerBalanceVar] = response;
  }

  // @given('banker has L2 balance {string} of at least {string}')
  public async checkBankerBalance(bankerBalanceVar: string, amount: string) {
    const banker = await this.stepSharedState.getBanker();
    const ownerAddress = await banker.ethSigner.getAddress();
    const response = await this.client.getBalance({
      owner: ownerAddress.toLowerCase(),
      address: StepSharedState.getTokenAddress('ETH'),
    });
    this.stepSharedState.bankerBalances[bankerBalanceVar] = response;
    // @ts-ignore
    assert.ok(parseEther(response.balance!).gte(parseEther(amount)));
  }

  // @then(
  //   'banker should have balance {string} increased by {string} eth',
  //   undefined,
  //   10 * 60 * 1000,
  // )
  public async accountBalanceShouldEqual(
    bankerBalanceVar: string,
    balanceDiff: string,
  ) {
    const banker = await this.stepSharedState.getBanker();
    const bankerAddress = await banker.ethSigner.getAddress();
    const prevBalance = this.stepSharedState.bankerBalances[bankerBalanceVar];
    const expected = parseEther(formatEther(prevBalance.balance!).toString()).add(
      parseEther(balanceDiff),
    );

    await repeatCheck600(async () => {
      const response = await this.client.getBalance({
        owner: bankerAddress,
        address: StepSharedState.getTokenAddress('ETH'),
      });
      // @ts-ignore
      assert.equal(response.balance!, expected.toString());
    });
  }
}
