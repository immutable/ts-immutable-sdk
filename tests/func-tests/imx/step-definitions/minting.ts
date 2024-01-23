/* eslint-disable @typescript-eslint/naming-convention */
import { MintFee, MintTokenDataV2 } from '@imtbl/core-sdk';
import * as assert from 'assert';
import { IMXClient, ImxClientModuleConfiguration } from '@imtbl/sdk/x';
import { env, repeatCheck300 } from '../common';
import { configuration, StepSharedState } from './stepSharedState';

// @binding([StepSharedState])
export class Minting {
  constructor(protected stepSharedState: StepSharedState) {}

  config: ImxClientModuleConfiguration = {
    baseConfig: { environment: configuration.environment },
  };

  client = new IMXClient(this.config);

  // @given('randomly L2 minted to {string} of {string}', undefined, 10000)
  // @when('randomly L2 mint to {string} of {string}', undefined, 10000)
  public async l2Mint(addressVar: string, assetVar: string) {
    try {
      const minter = await this.stepSharedState.getMinter();
      const userAddress = await this.stepSharedState.users[addressVar].ethSigner.getAddress();
      const mintTo = userAddress.toLowerCase();
      const mintCount = 1;

      // Mint params
      const royalties: MintFee[] = [];

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const tokens: MintTokenDataV2[] = [...Array(mintCount).keys()].map((_) => ({
        id: `${Math.ceil(10000000000 * Math.random())}`,
        blueprint: '{onchain-metadata}',
        ...(royalties.length > 0 && { royalties }),
      }));

      const contractAddress = env.tokenAddress;

      // Keep order of the fields as this will be converted to a string and fields order is important
      const users = [
        {
          user: mintTo,
          tokens,
        },
      ];

      console.log('Minting request', JSON.stringify({
        users,
        royalties,
        contract_address: contractAddress,
      }));

      const apiResult = await this.client.mint(minter.ethSigner, {
        users,
        royalties,
        contract_address: contractAddress,
      });

      console.log('Mint result', apiResult);

      const asset = apiResult.results && apiResult.results.length > 0
        ? apiResult.results[0]
        : undefined;
      assert.ok(asset !== undefined, 'No asset');
      this.stepSharedState.tokens[assetVar] = asset;
      this.stepSharedState.nfts[assetVar] = {
        type: { MINTABLE_ERC721: 'MINTABLE_ERC721' },
        data: {
          id: tokens[0].id,
          blueprint: tokens[0].blueprint!,
          token_address: contractAddress,
          royalties: [],
        },
      };
    } catch (e) {
      console.log('BOOM! Exception');
      console.log(e);
      throw e;
    }
  }

  // @then(
  //   'NFT {string} should be available through api',
  //   undefined,
  //   5 * 60 * 1000,
  // )
  public async checkL2MintedAsset(assetVar: string) {
    const token = this.stepSharedState.tokens[assetVar];
    assert.ok(token.token_id !== undefined, 'Stored token has no id');
    console.log(`check nft: ${token.token_id} on address ${env.tokenAddress}`);
    await repeatCheck300(async () => {
      const asset = await this.client.getAsset({
        tokenAddress: env.tokenAddress,
        tokenId: token.token_id!,
      });
      assert.equal(asset.token_id, token.token_id!);
    });
  }
}
