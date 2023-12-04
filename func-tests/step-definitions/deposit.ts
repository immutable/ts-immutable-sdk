import { strict as assert } from 'assert';
import { formatEther, parseEther } from '@ethersproject/units';
import { ImmutableXClient, ImxClientModuleConfiguration } from '@imtbl/sdk/immutablex_client';
import { GenericIMXProvider, ProviderConfiguration } from '@imtbl/sdk/provider';
import { StepSharedState, configuration } from './stepSharedState';
import {
  env, getProvider, repeatCheck600, waitForTransactionResponse,
} from '../common';

// @binding([StepSharedState])
export class DepositEth {
  constructor(protected stepSharedState: StepSharedState) {}

  config: ImxClientModuleConfiguration = {
    baseConfig: { environment: configuration.environment },
  };

  provider = getProvider(env.network, env.alchemyApiKey);

  providerConfig = new ProviderConfiguration({
    baseConfig: configuration,
  });

  // client = new ImmutableX(oldConfig);
  client = new ImmutableXClient(this.config);

  // @when('banker deposits {string} eth', undefined, 120 * 1000)
  public async bankerDepositEth(amount: string) {
    // TODO: need to make sure this addressVar has ETH on L1 to deposit
    const banker = await this.stepSharedState.getBanker();
    const providerInstance = new GenericIMXProvider(this.providerConfig, banker.ethSigner, banker.starkSigner);

    const transactionResponse = await providerInstance.deposit({
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
      assert.equal(response.balance!, expected.toString());
    });
  }
}
