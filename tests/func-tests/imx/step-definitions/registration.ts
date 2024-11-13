import fs from 'fs';
import { strict as assert } from 'assert';
import {
  ProviderConfiguration,
  GenericIMXProvider,
  createStarkSigner,
  generateStarkPrivateKey,
} from '@imtbl/sdk/x';
import { configuration, StepSharedState } from './stepSharedState';
import { getProvider, env } from '../common';
import { Wallet } from 'ethers';

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

const sharedStateFile = 'sharedState.json';

type PersistedSharedState = {
  users: {
    [key: string]: {
      ethPrivateKey: string;
      starkPrivateKey: string;
    };
  };
};

export class Registration {
  constructor(protected stepSharedState: StepSharedState) {}

  providerConfig = new ProviderConfiguration({
    baseConfig: configuration,
  });

  // eslint-disable-next-line class-methods-use-this
  private async persistState(user: string, ethPrivateKey: string, starkPrivateKey: string) {
    const state: PersistedSharedState = {
      users: {
        [user]: {
          ethPrivateKey,
          starkPrivateKey,
        },
      },
    };
    fs.writeFileSync(sharedStateFile, JSON.stringify(state, null, 2));
  }

  // eslint-disable-next-line class-methods-use-this
  private async hydrateState(): Promise<PersistedSharedState | false> {
    // check if file exists
    if (!fs.existsSync(sharedStateFile)) {
      return false;
    }

    const state = fs.readFileSync(sharedStateFile, 'utf8');
    return JSON.parse(state);
  }

  public async addNewWallet(addressVar: string, persist?: boolean) {
    // L1 credentials
    const ethSigner = Wallet.createRandom().connect(provider);

    // L2 credentials
    const starkPrivateKey = generateStarkPrivateKey();
    const starkSigner = createStarkSigner(starkPrivateKey);

    if (persist) {
      await this.persistState(addressVar, ethSigner.privateKey, starkPrivateKey);
    }

    this.stepSharedState.users[addressVar] = {
      ethSigner,
      starkSigner,
    };
    return ethSigner.publicKey;
  }

  public async restoreUserWallet(addressVar: string) {
    const state = await this.hydrateState();
    if (state) {
      const user = state.users[addressVar];
      const ethSigner = new Wallet(user.ethPrivateKey).connect(provider);
      const starkSigner = createStarkSigner(user.starkPrivateKey);
      this.stepSharedState.users[addressVar] = {
        ethSigner,
        starkSigner,
      };
    } else {
      throw new Error('No persisted user state found');
    }
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
