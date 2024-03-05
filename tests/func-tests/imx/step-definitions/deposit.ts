import { strict as assert } from 'assert';
import { formatEther, parseEther } from '@ethersproject/units';
import {
  IMXClient,
  ImxModuleConfiguration,
  GenericIMXProvider,
  ProviderConfiguration,
} from '@imtbl/sdk/x';
import { StepSharedState, configuration } from './stepSharedState';
import {
  env, getProvider, repeatCheck600, waitForTransactionResponse,
} from '../common';

// @binding([StepSharedState])
export class DepositEth {
  constructor(protected stepSharedState: StepSharedState) {}

  config: ImxModuleConfiguration = {
    baseConfig: { environment: configuration.environment },
  };

  provider = getProvider(env.network, env.alchemyApiKey);

  providerConfig = new ProviderConfiguration({
    baseConfig: configuration,
  });

  // client = new ImmutableX(oldConfig);
  client = new IMXClient(this.config);

  // @when('banker deposits {string} eth', undefined, 120 * 1000)
  public async bankerDepositEth(amount: string) {
    // TODO: need to make sure this addressVar has ETH on L1 to deposit
    const banker = await this.stepSharedState.getBanker();
    const imxProvider = new GenericIMXProvider(this.providerConfig, banker.ethSigner, banker.starkSigner);

    const transactionResponse = await imxProvider.deposit({
      type: 'ETH',
      amount: parseEther(amount).toString(),
    });

    return await waitForTransactionResponse(transactionResponse);
  }

  // @given('banker has at least {string} eth balance on L1')
  public async checkBankerL1Balance(amountEth: string) {
    const banker = await this.stepSharedState.getBanker();
    const onChainBalance = await banker.ethSigner.getBalance();
    if (onChainBalance.lt(parseEther(amountEth))) {
      console.log('Banker balance', onChainBalance.toString());
      console.log('Amount', parseEther(amountEth).toString());
    }
    assert.ok(onChainBalance.gte(parseEther(amountEth)));
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
    if (parseEther(response.balance!).lt(parseEther(amount))) {
      console.log('Banker address', ownerAddress, 'Banker balance:', response.balance, 'amount:', amount);
    }
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
