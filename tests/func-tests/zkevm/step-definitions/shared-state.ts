import { BlockchainData, BlockchainDataModuleConfiguration } from '@imtbl/sdk/blockchain_data';
import { ImmutableConfiguration, Environment } from '@imtbl/sdk/config';

import { BigNumber, Wallet, ethers } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { strict as assert } from 'assert';

import {
  IERC721HybridPermissionedMintable,
  IERC721PermissionedMintable,
} from '../lib/collection';
import { env } from '../config/env';
import { IOperatorAllowlist } from '../lib/operator-allowlist';
import { addIMX } from '../lib/banker';
import { promiseTimeout } from '../lib/utils';
import { DEFAULT_TIMEOUT } from '../config/constants';

const {
  utils: { formatEther, parseUnits, parseEther },
} = ethers;

const provider = new JsonRpcProvider({
  url: env.rpcUrl,
  headers: {
    'X-API-Key': env.apiRateLimitBypassKey,
    'x-immutable-api-key': env.imxAPIKey,
  },
});

// Wallet indexes
const deployerIndex = 0;
const minterIndex = 1;
const buyerIndex = 2;
const sellerIndex = 3;
const spenderIndex = 4;

const globalState: any = {
  metadataChecked: false,
};

export class SharedState {
  public blockchainData: BlockchainData;

  // TODO right now this is giving us https://indexer-mr.dev.imtbl.com/v1
  public environment: Environment = Environment.SANDBOX;

  public wallets: { [key: string]: string } = {};

  public deployedOperatorAllowlist: IOperatorAllowlist | null = null;

  public deployedCollection: IERC721PermissionedMintable | null = null;

  public deployedHybridCollection: IERC721HybridPermissionedMintable | null = null;

  public deployedReceiver: string | null = null;

  // TODO: FIX FOR SANDBOX
  public chainId = '13473';

  public workerID: string;

  // Stub in existing collection
  // public deployedCollection: IERC721PermissionedMintable | null = {
  //   sdk: new ERC721PermissionedMintable(
  //     '0x6EBD4d33aFcF272CC3CdCc7F26381564B402c158',
  //   ),
  //   address: '0x6EBD4d33aFcF272CC3CdCc7F26381564B402c158',
  // };

  constructor() {
    const config: BlockchainDataModuleConfiguration = {
      baseConfig: new ImmutableConfiguration({
        environment: this.environment,
      }),
      overrides: {
        basePath: env.apiUrl,
        headers: {
          'X-API-Key': env.apiRateLimitBypassKey,
          'x-immutable-api-key': env.imxAPIKey,
        },
      },
    };

    this.blockchainData = new BlockchainData(config);

    this.workerID = process.env.CUCUMBER_WORKER_ID || '0';
  }

  public async topUpIfNecessary(
    address: string,
    minimum: string,
  ): Promise<BigNumber> {
    let balance = await this.provider.getBalance(address);
    const parsedAmount = parseUnits(minimum, 18);
    if (balance.lt(parsedAmount)) {
      // add between 5-10x the minimum, so they request less often
      // randomisation is to avoid multiple workers requesting at the same time
      const randomAmount = 5 + Math.random() * 10;
      const oneBN: BigNumber = parseUnits('1', 18);
      const amount = parsedAmount
        .mul(BigNumber.from(parseEther(randomAmount.toString())))
        .div(oneBN);

      await promiseTimeout(addIMX(address, amount), DEFAULT_TIMEOUT);
      balance = await this.provider.getBalance(address);
    }

    assert.ok(
      balance.gte(parsedAmount),
      `${address} has insufficient funds ${ethers.utils.formatEther(balance)}`,
    );

    return balance;
  }

  // Collections
  deployedContractAddress: string | null = null;

  // Sale
  saleActivityParams: { contractAddress: string; tokenId: string } | null = null;

  saleActivityId: string | null = null;

  // General
  get chainName() {
    return env.chainName;
  }

  get provider() {
    return provider;
  }

  private getWallet(index: number): ethers.Wallet {
    if (env.privateKey) {
      return new ethers.Wallet(env.privateKey);
    }

    const wallet = ethers.Wallet.fromMnemonic(
      env.mnemonic,
      `m/44'/60'/0'/${this.workerID}/${index}`,
    );
    return wallet;
  }

  // Wallets
  get deployer(): Wallet {
    const wallet = this.getWallet(deployerIndex);
    // eslint-disable-next-line no-console
    console.log(
      `✅ Worker (${this.workerID}) Deployer Address: ${wallet.address}`,
    );
    return wallet.connect(provider);
  }

  get seller(): Wallet {
    const wallet = this.getWallet(sellerIndex);
    // eslint-disable-next-line no-console
    console.log(
      `✅ Worker (${this.workerID}) Seller Address: ${wallet.address}`,
    );
    return wallet.connect(provider);
  }

  get buyer(): Wallet {
    const wallet = this.getWallet(buyerIndex);
    // eslint-disable-next-line no-console
    console.log(
      `✅ Worker (${this.workerID}) Buyer Address: ${wallet.address}`,
    );
    return wallet.connect(provider);
  }

  get minter(): Wallet {
    const wallet = this.getWallet(minterIndex);
    // eslint-disable-next-line no-console
    console.log(
      `✅ Worker (${this.workerID}) Minter Address: ${wallet.address}`,
    );
    return wallet.connect(provider);
  }

  get spender(): Wallet {
    const wallet = this.getWallet(spenderIndex);
    // eslint-disable-next-line no-console
    console.log(
      `✅ Worker (${this.workerID}) Spender Address: ${wallet.address}`,
    );
    return wallet.connect(provider);
  }

  get metadataChecked(): boolean {
    return globalState.metadataChecked;
  }

  set metadataChecked(checked: boolean) {
    globalState.metadataChecked = checked;
  }
}
