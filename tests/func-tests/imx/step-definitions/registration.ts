import { strict as assert } from 'assert';
import { Wallet } from '@ethersproject/wallet';
import {
  ProviderConfiguration,
  GenericIMXProvider,
  createStarkSigner,
  generateStarkPrivateKey,
} from '@imtbl/sdk/x';
import { configuration, StepSharedState } from './stepSharedState';
import { getProvider, env } from '../common';

const provider = getProvider(env.network, env.alchemyApiKey);

// Todo: See if we need to use different config for tets here in Unified SDK. Like ChainID and contract addresses.
// const imxConfig: ImmutableXConfiguration = {
//   ethConfiguration: {
//     chainID: testChainId,
//     coreContractAddress: '0x2d5C349fD8464DA06a3f90b4B0E9195F3d1b7F98',
//     registrationContractAddress: '0xDbA6129C02E69405622fAdc3d5A7f8d23eac3b97',
//   },
//   apiConfiguration: {
//     accessToken: undefined,
//     apiKey: undefined,
//     baseOptions: {
//       headers: {
//         // eslint-disable-next-line @typescript-eslint/naming-convention
//         'x-sdk-version': 'imx-core-sdk-ts-1.0.1',
//       },
//     },
//     basePath: 'https://api.sandbox.x.immutable.com',
//     formDataCtor: undefined,
//     password: undefined,
//     username: undefined,
//     isJsonMime(): boolean {
//       return true;
//     },
//   },
// };

export class Registration {
  constructor(protected stepSharedState: StepSharedState) {}

  providerConfig = new ProviderConfiguration({
    baseConfig: configuration,
  });

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

    const imxProvider = new GenericIMXProvider(this.providerConfig, user.ethSigner, user.starkSigner);
    await imxProvider.registerOffchain();

    return {
      address: await imxProvider.getAddress(),
      starkPublicKey: await user.starkSigner.getAddress(),
    };
  }

  public async registerBanker() {
    const banker = await this.stepSharedState.getBanker();
    const imxProvider = new GenericIMXProvider(this.providerConfig, banker.ethSigner, banker.starkSigner);
    await imxProvider.registerOffchain();
    return {
      address: await banker.ethSigner.getAddress(),
    };
  }

  public async checkUserRegistrationOffchain(addressVar: string) {
    const user = this.stepSharedState.users[addressVar];

    const imxProvider = new GenericIMXProvider(this.providerConfig, user.ethSigner, user.starkSigner);
    const registered = await imxProvider.isRegisteredOffchain();
    assert.equal(registered, true);
  }
}
