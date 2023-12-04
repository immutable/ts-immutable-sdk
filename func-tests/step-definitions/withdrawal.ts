import { ETHToken, ImmutableX } from '@imtbl/core-sdk';
import { GenericIMXProvider, ProviderConfiguration } from '@imtbl/sdk/provider';
import { configuration, oldConfig, StepSharedState } from './stepSharedState';
import { parseUnits } from '@ethersproject/units';
import { repeatCheck30, repeatCheck300 } from 'common';
import { strict as assert } from 'assert';
export class Withdrawal {
  constructor(protected stepSharedState: StepSharedState) {}

  providerConfig = new ProviderConfiguration({
    baseConfig: configuration,
  });
  client = new ImmutableX(oldConfig);

  // @when('user {string} prepare withdrawal of NFT {string}', undefined, 30000)
  // public async prepareWithdrawal(userVar: string, nftVar: string) {
  //   const user = this.stepSharedState.users[userVar];
  //   const nft = this.stepSharedState.nfts[nftVar];

  //   return this.client.prepareWithdrawal(user, {
  //     type: 'ERC721',
  //     tokenId: nft.data.id,
  //     tokenAddress: nft.data.token_address,
  //   });
  // }

  // @when(
  //   'user {string} prepare withdrawal {string} of ETH {string}',
  //   undefined,
  //   30000,
  // )
  public async prepareEthWithdrawal(
    userVar: string,
    withdrawalName: string,
    ethAmount: string,
  ) {
    const user = this.stepSharedState.users[userVar];
    const providerInstance = new GenericIMXProvider(this.providerConfig, user.ethSigner, user.starkSigner);
    const ethAmountInWei = parseUnits(ethAmount);
    // const result = await providerInstance.prepareWithdrawal({ type: 'ETH', amount: ethAmountInWei.toString() });
    const result = await this.client.prepareWithdrawal(user, {
      type: 'ETH',
      amount: parseUnits(ethAmount, 18).toString(),
    });

    this.stepSharedState.withdrawals[withdrawalName] = result;
    return result;
  }

  // because withdrawable status needs a larger timeout, we set 300 seconds here.
  // @then('NFT {string} should be in {string} status', undefined, 300000)
  // public async checkWithdrawableStatus(nftVar: string, status: string) {
  //   const nft = this.stepSharedState.nfts[nftVar];
  //   const repeatCheckFunction =
  //     status === 'withdrawable' ? repeatCheck300 : repeatCheck30;
  //   await repeatCheckFunction(async () => {
  //     const asset = await this.client.getAsset({
  //       tokenAddress: nft.data.token_address,
  //       tokenId: nft.data.id,
  //     });
  //     assert.equal(asset.status, status);
  //   });
  // }

  // @then(
  //   'ETH withdrawal {string} should be in {string} status',
  //   undefined,
  //   300000,
  // )
  public async checkWithdrawableEthStatus(
    withdrawalName: string,
    status: string,
  ) {
    const id = this.stepSharedState.withdrawals[withdrawalName].withdrawal_id!;
    const repeatCheckFunction =
      status === 'withdrawable' ? repeatCheck300 : repeatCheck30;
    await repeatCheckFunction(async () => {
      const withdrawal = await this.client.getWithdrawal({
        id: id.toString(),
      });
      assert.equal(withdrawal.status, status);
    });
  }

  public async completeEthWithdrawal(userVar: string) {
    const user = this.stepSharedState.users[userVar];
    const starkAddress = await user.starkSigner.getAddress();
    const providerInstance = new GenericIMXProvider(this.providerConfig, user.ethSigner, user.starkSigner);
    const token : ETHToken = { type: 'ETH' } as ETHToken;
    const result = await providerInstance.completeWithdrawal(starkAddress, token);
    console.log(`Eth withdrawal transaction complete. txHash: ${result.hash}`);
  }

  // @when('user {string} completes withdrawal of NFT {string}', undefined, 60000)
  // public async completeNFTWithdrawal(userVar: string, nftVar: string) {
  //   const user = this.stepSharedState.users[userVar];
  //   const starkAddress = await user.starkSigner.getAddress();
  //   const nft = this.stepSharedState.nfts[nftVar];
  //   const result = await this.client.completeWithdrawal(
  //     user.ethSigner,
  //     starkAddress,
  //     {
  //       type: 'ERC721',
  //       tokenId: nft.data.id,
  //       tokenAddress: nft.data.token_address,
  //     },
  //   );
  //   console.log(
  //     `NFT - Mintable_ERC21 - withdrawal transaction complete. txHash: ${result.hash}`,
  //   );
  // }

  // @then(
  //   'user {string} completes withdrawal of a withdrawable NFT',
  //   undefined,
  //   60000,
  // )
  // public async completeWithdrawalOfRandomERC721(userVar: string) {
  //   const user = this.stepSharedState.users[userVar];
  //   const userAddress = await user.ethSigner.getAddress();
  //   const starkAddress = await user.starkSigner.getAddress();
  //   const apiResponse = await this.client.listWithdrawals({
  //     rollupStatus: 'confirmed',
  //     withdrawnToWallet: false,
  //     user: userAddress,
  //     tokenType: 'ERC721',
  //   });
  //   const results = apiResponse.result || [];
  //   if (results.length === 0) {
  //     throw new Error('No available withdrawable NFTs');
  //   }
  //   const { token_address: tokenAddress, token_id: tokenId } =
  //     results[0].token!.data!;

  //   const response = await this.client.completeWithdrawal(
  //     user.ethSigner,
  //     starkAddress,
  //     {
  //       type: 'ERC721',
  //       tokenId: tokenId!,
  //       tokenAddress: tokenAddress!,
  //     },
  //   );

  //   console.log('Completed withdrawal for token');
  //   console.log({
  //     tokenAddress: tokenAddress!,
  //     tokenId: tokenId!,
  //     txHash: response.hash,
  //   });
  // }

  //   @then('user {string} completes withdrawal of a ERC20', undefined, 60000)
  //   public async completeWithdrawalOfRandomERC20(userVar: string) {
  //     const userWalletConnection = this.stepSharedState.users[userVar];

  //     //Find a given ERC721 withdrawal ready to be complete
  //     const withdrawalsList = await this.client.listWithdrawals({
  //       rollupStatus: 'confirmed',
  //       withdrawnToWallet: false,
  //       tokenType: 'ERC20',
  //     });
  //     const results = withdrawalsList.result || [];
  //     if (results.length === 0) {
  //       throw new Error('No available ERC20s to be withdrawn');
  //     }
  //     const { token_address: tokenAddress, token_id: tokenId } =
  //       results[0].token!.data!;

  //     //As we are completing a random withdrawal, we need to find the publicStarkKey that is meant to receive the funds associated with the withdrawal
  //     const user = await this.client.getUser(results[0].sender!);
  //     const senderPublicKey = user.accounts![0];

  //     const response = await this.client.completeWithdrawal(
  //       userWalletConnection.ethSigner,
  //       senderPublicKey,
  //       {
  //         type: 'ERC20',
  //         tokenAddress: tokenAddress!,
  //       },
  //     );

//     console.log('Completed withdrawal for token');
//     console.log({
//       tokenAddress: tokenAddress!,
//       tokenId: tokenId!,
//       txHash: response.hash,
//       withdrawalId: results[0].transaction_id,
//     });
//   }
}
