import { strict as assert } from 'assert';
import { ethers } from 'hardhat';

import { SharedState } from './shared-state';
import {repeatCheck300, repeatCheck, defaultGasOverrides} from '../lib/utils';

export class Tokens {
  constructor(protected sharedState: SharedState) {}
  // @when(
  //   'deployer deploys an ERC20 contract {string} with symbol {string}',
  //   undefined,
  //   120 * 1000,
  // )
  public async deployERC20Contract(name: string, symbol: string) {
    const { deployer } = this.sharedState;
    // deploy MyERC20 contract
    const contractFactory = await ethers.getContractFactory('MyERC20');
    const contract = await contractFactory
      .connect(deployer)
      .deploy(name, symbol, defaultGasOverrides);
    await contract.deployed();

    // log deployed contract address
    console.log(`MyERC20 contract ${name} deployed to ${contract.address}`);

    this.sharedState.deployedContractAddress = contract.address;
  }

  // @then(
  //   'deployed erc20 contract should be indexed correctly',
  //   undefined,
  //   DEFAULT_TIMEOUT,
  // )
  public async checkDeployedERC20Contract() {
    const { chainName, deployedContractAddress } = this.sharedState;
    if (!deployedContractAddress)
      return assert.fail('No deployed contract address');

    await repeatCheck300(async () => {
      const token = await this.sharedState.blockchainData.getToken({
        chainName,
        contractAddress: deployedContractAddress,
      });
      assert.ok(token.result);

      // Assert onchain metadata is indexed
      assert.ok(token.result.name);
      assert.ok(token.result.symbol);
    });
  }

  // @then('sdk should list tokens')
  public async listTokens() {
    const { chainName } = this.sharedState;

    await repeatCheck(60)(async () => {
      const tokens = await this.sharedState.blockchainData.listTokens({
        chainName,
      });
      assert.ok(tokens.result);
    });
  }
}
