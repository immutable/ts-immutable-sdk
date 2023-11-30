import { strict as assert } from 'assert';
import { Wallet } from '@ethersproject/wallet';
import {
  createStarkSigner,
  generateStarkPrivateKey,
  ImmutableX,
} from '@imtbl/core-sdk';
import { configuration, StepSharedState } from './stepSharedState';
import { getProvider, repeatCheck20, env } from '../common';

const provider = getProvider(env.network, env.alchemyApiKey);

export class Registration {
  constructor(protected stepSharedState: StepSharedState) {}

  client = new ImmutableX(configuration);

  public async addNewWallet(addressVar: string) {
    // L1 credentials
    const ethSigner = Wallet.createRandom().connect(provider);

    // L2 credentials
    const starkPrivateKey = generateStarkPrivateKey();
    const starkSigner = createStarkSigner(starkPrivateKey);

    this.stepSharedState.users[addressVar] = {
      ethSigner,
      starkSigner,
    };
    return ethSigner.publicKey;
  }

  public async register(addressVar: string) {
    const user = this.stepSharedState.users[addressVar];

    await this.client.registerOffchain(user);

    return {
      address: await user.ethSigner.getAddress(),
      starkPublicKey: await user.starkSigner.getAddress(),
    };
  }

  public async registerBanker() {
    const banker = await this.stepSharedState.getBanker();

    await this.client.registerOffchain(banker);

    return {
      address: await banker.ethSigner.getAddress(),
    };
  }

  // @then(
  //   'user {string} should be available through api',
  //   undefined,
  //   5 * 60 * 1000,
  // )
  public async checkUserRegistrationOffchain(addressVar: string) {
    const user = this.stepSharedState.users[addressVar];
    const userAddress = await user.ethSigner.getAddress();
    const userStarkAddress = await user.starkSigner.getAddress();
    await repeatCheck20(async () => {
      const response = await this.client.getUser(userAddress);
      assert.equal(response.accounts![0], userStarkAddress);
    });
  }
}
