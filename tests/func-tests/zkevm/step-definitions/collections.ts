/* eslint-disable consistent-return */
/* eslint-disable no-console */
// import { binding, then, given, when } from 'cucumber-tsflow';
import { strict as assert } from 'assert';

import { SharedState } from './shared-state';
import { CONTRACT_METADATA } from './metadata';

import {
  repeatCheck,
  repeatCheck300,
  waitForTransactionResponse,
} from '../lib/utils';
import {
  BASE_URI,
  CONTRACT_URI,
  deployCollection,
  deployHybridCollection,
  deployReceiver,
} from '../lib/collection';
import { deployOperatorAllowlist } from '../lib/operator-allowlist';

// @binding([SharedState])
export class Collections {
  constructor(protected sharedState: SharedState) {}

  // @when('deployer deploys a operator allowlist', undefined, 120 * 1000)
  public async deployOperatorAllowlist() {
    const { deployer } = this.sharedState;

    const allowlist = await deployOperatorAllowlist(deployer);

    console.log(`MyOperatorAllowlist deployed to ${allowlist.address}`);

    this.sharedState.deployedOperatorAllowlist = allowlist;
  }

  // @when(
  //   'deployer deploys a hybrid NFT contract {string} with symbol {string}',
  //   undefined,
  //   120 * 1000,
  // )
  public async deployHybridNFTContract(name: string, symbol: string) {
    const { deployer, deployedOperatorAllowlist } = this.sharedState;
    if (!deployedOperatorAllowlist) { return assert.fail('No deployed operator allowlist'); }

    const contract = await deployHybridCollection(
      deployer,
      name,
      symbol,
      deployedOperatorAllowlist.address,
    );

    console.log(
      `MyERC721Hybrid contract ${name} deployed to ${contract.address}`,
    );

    this.sharedState.deployedHybridCollection = contract;
  }

  // @when(
  //   'deployer deploys an NFT contract {string} with symbol {string}',
  //   undefined,
  //   120 * 1000,
  // )
  public async deployNFTContract(name: string, symbol: string) {
    const { deployer, deployedOperatorAllowlist } = this.sharedState;
    if (!deployedOperatorAllowlist) { return assert.fail('No deployed operator allowlist'); }

    const contract = await deployCollection(
      deployer,
      name,
      symbol,
      deployedOperatorAllowlist.address,
    );

    console.log(`MyERC721 contract ${name} deployed to ${contract.address}`);

    this.sharedState.deployedCollection = contract;
  }

  // @given('an already deployed hybrid collection', undefined, DEFAULT_TIMEOUT)
  public async ensureDeployedHybridCollection() {
    const {
      chainName,
      deployedOperatorAllowlist,
      deployedHybridCollection,
      deployer,
    } = this.sharedState;

    if (!deployedOperatorAllowlist) {
      return assert.fail('no deployed operator allowlist');
    }

    // Check if shared state contains an already deployed collection
    if (deployedHybridCollection) {
      console.log(
        `\nUsing already deployed hybrid collection: ${deployedHybridCollection.address}`,
      );
      return true;
    }

    // Deploy a collection if there isnt one
    const name = 'TestNFT';
    const symbol = 'TNFT';
    const contract = await deployHybridCollection(
      deployer,
      name,
      symbol,
      deployedOperatorAllowlist.address,
    );

    console.log(
      `\nMyERC721Hybrid contract ${name} deployed to ${contract.address}`,
    );

    await repeatCheck(60)(async () => {
      if (!this.sharedState.deployedHybridCollection) return;

      const contractAddress = this.sharedState.deployedHybridCollection.address;

      await this.sharedState.blockchainData.getCollection({
        chainName,
        contractAddress,
      });
    });

    console.log(
      '✅ Hybrid Collection has been indexed.\nSaving to shared state...',
    );

    this.sharedState.deployedHybridCollection = contract;
  }

  // @given('an already deployed receiver', undefined, DEFAULT_TIMEOUT)
  public async ensureDeployedReceiver() {
    const { deployedReceiver, deployer } = this.sharedState;

    // Check if shared state contains an already deployed receiver
    if (deployedReceiver) {
      console.log(`✅ Using already deployed receiver: ${deployedReceiver}`);
      return true;
    }

    // Deploy a receiver if there isnt one
    const contract = await deployReceiver(deployer);

    console.log(`✅ MyERC721Receiver contract deployed to ${contract}`);

    this.sharedState.wallets.receiver = contract;
    this.sharedState.deployedReceiver = contract;
  }

  // @given(
  //   'minter has minter role for the deployed collection',
  //   undefined,
  //   DEFAULT_TIMEOUT,
  // )
  public async minterHasRole() {
    const {
      deployedCollection, minter, provider, deployer,
    } = this.sharedState;

    assert.ok(
      deployedCollection,
      'Cannot find deployed collection. Ensure collection deployment step has been run.',
    );

    const minterRole = await deployedCollection.sdk.MINTER_ROLE(provider);

    const hasMinterRole = await deployedCollection.sdk.hasRole(
      provider,
      minterRole,
      minter.address,
    );

    if (!hasMinterRole) {
      console.log(
        `${minter.address} has no MINTER_ROLE for contract ${deployedCollection.address}`,
      );
      const populatedTransaction = await deployedCollection.sdk.populateGrantMinterRole(minter.address);

      console.log(`Granting MINTER_ROLE to ${minter.address}...`);
      const tx = await deployer.sendTransaction(populatedTransaction);
      await waitForTransactionResponse(tx);

      await repeatCheck(60)(async () => {
        const hasRole = await deployedCollection.sdk.hasRole(
          provider,
          minterRole,
          minter.address,
        );
        if (!hasRole) {
          throw new Error('MINTER_ROLE not granted');
        }
      });

      console.log(`✅ MINTER_ROLE has been granted to ${minter.address}.`);
    } else {
      console.log(
        `✅ ${minter.address} already has MINTER_ROLE for contract ${deployedCollection.address}`,
      );
    }
  }

  // @given(
  //   'minter has minter role for the deployed hybrid collection',
  //   undefined,
  //   DEFAULT_TIMEOUT,
  // )
  public async hybridMinterHasRole() {
    const {
      deployedHybridCollection, minter, provider, deployer,
    } = this.sharedState;

    assert.ok(
      deployedHybridCollection,
      'Cannot find deployed hybrid collection. Ensure collection deployment step has been run.',
    );

    const minterRole = await deployedHybridCollection.sdk.MINTER_ROLE(provider);

    const hasMinterRole = await deployedHybridCollection.sdk.hasRole(
      provider,
      minterRole,
      minter.address,
    );

    if (!hasMinterRole) {
      console.log(
        `${minter.address} has no MINTER_ROLE for contract ${deployedHybridCollection.address}`,
      );
      const populatedTransaction = await deployedHybridCollection.sdk.populateGrantMinterRole(
        minter.address,
      );

      console.log(`Granting MINTER_ROLE to ${minter.address}...`);
      const txn = await deployer.sendTransaction(populatedTransaction);
      await txn.wait();

      await repeatCheck(60)(async () => {
        await deployedHybridCollection.sdk.hasRole(
          provider,
          minterRole,
          minter.address,
        );
      });

      console.log(`✅ MINTER_ROLE has been granted to ${minter.address}.`);
    }
    console.log(
      `✅ ${minter.address} already has MINTER_ROLE for contract ${deployedHybridCollection.address}`,
    );
  }

  // @given('an already deployed collection', undefined, DEFAULT_TIMEOUT)
  public async ensureDeployedCollection() {
    const {
      chainName,
      deployedOperatorAllowlist,
      deployedCollection,
      deployer,
    } = this.sharedState;

    if (!deployedOperatorAllowlist) {
      return assert.fail('no deployed operator allowlist');
    }

    // Check if shared state contains an already deployed collection
    if (deployedCollection) {
      console.log(
        `\nUsing already deployed collection: ${deployedCollection.address}`,
      );
      return true;
    }

    // Deploy a collection if there isnt one
    const name = 'TestNFT';
    const symbol = 'TNFT';
    const contract = await deployCollection(
      deployer,
      name,
      symbol,
      deployedOperatorAllowlist.address,
    );

    console.log(`\nMyERC721 contract ${name} deployed to ${contract.address}`);

    await repeatCheck(60)(async () => {
      if (!this.sharedState.deployedCollection) return;

      const contractAddress = this.sharedState.deployedCollection.address;

      await this.sharedState.blockchainData.getCollection({
        chainName,
        contractAddress,
      });
    });

    console.log('✅ Collection has been indexed.\nSaving to shared state...');

    this.sharedState.deployedCollection = contract;
  }

  // @then(
  //   'deployed contract should be indexed correctly',
  //   undefined,
  //   DEFAULT_TIMEOUT,
  // )
  public async checkDeployedContract() {
    const { chainName, deployedCollection, deployedHybridCollection } = this.sharedState;
    const collection = deployedCollection || deployedHybridCollection;
    if (!collection) return assert.fail('No deployed collection');

    await repeatCheck300(async () => {
      const collectionData = await this.sharedState.blockchainData.getCollection({
        chainName,
        contractAddress: collection.address,
      });
      assert.ok(collectionData.result);

      // Assert onchain metadata is indexed
      assert.equal(collectionData.result.base_uri, BASE_URI);
      assert.equal(collectionData.result.contract_uri, CONTRACT_URI);
      assert.ok(collectionData.result.symbol);

      // Assert offchain metadata is indexed
      assert.equal(collectionData.result.name, CONTRACT_METADATA.name);
      assert.equal(
        collectionData.result.description,
        CONTRACT_METADATA.description,
      );
      assert.equal(
        collectionData.result.external_link,
        CONTRACT_METADATA.external_link,
      );
      assert.equal(collectionData.result.image, CONTRACT_METADATA.image);
      assert.ok(collectionData.result.last_metadata_synced_at);
    });
  }

  // @then('sdk should list collections', undefined, DEFAULT_TIMEOUT)
  public async listCollections() {
    const { chainName } = this.sharedState;

    await repeatCheck(60)(async () => {
      const collections = await this.sharedState.blockchainData.listCollections(
        {
          chainName,
        },
      );
      assert.ok(collections.result);
    });
  }
}
