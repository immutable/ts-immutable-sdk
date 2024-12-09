/* eslint-disable @typescript-eslint/naming-convention */
import {
  ImxModuleConfiguration,
  GenericIMXProvider,
  ProviderConfiguration,
} from '@imtbl/sdk/x';
import { env, getProvider } from '../common';
import { configuration, StepSharedState } from './stepSharedState';
import { parseEther } from 'ethers';

export class Transfer {
  constructor(protected stepSharedState: StepSharedState) {}

  config: ImxModuleConfiguration = {
    baseConfig: { environment: configuration.environment },
  };

  provider = getProvider(env.network, env.alchemyApiKey);

  providerConfig = new ProviderConfiguration({
    baseConfig: configuration,
  });

  // @given('banker transfer {string} eth to {string}', undefined, 10000)
  public async transferFromBanker(amount: string, userVar: string) {
    try {
      const banker = await this.stepSharedState.getBanker();
      const receiver = await this.stepSharedState.users[
        userVar
      ].ethSigner.getAddress();

      const imxProvider = new GenericIMXProvider(this.providerConfig, banker.ethSigner, banker.starkSigner);
      return await imxProvider.transfer({
        type: 'ETH',
        amount: parseEther(amount).toString(),
        receiver,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
      throw e;
    }
  }

  public async transferL1EthFromBanker(amount: string, userVar: string) {
    try {
      const banker = await this.stepSharedState.getBanker();
      const receiver = await this.stepSharedState.users[
        userVar
      ].ethSigner.getAddress();

      await banker.ethSigner.sendTransaction({
        to: receiver,
        value: parseEther(amount),
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
      throw e;
    }
  }

  // cleanup - transfer eth back to banker
  // @then('{string} transfer {string} eth to banker', undefined, 10000)
  public async transferToBanker(userVar: string, amount: string) {
    const sender = this.stepSharedState.users[userVar];
    const banker = await this.stepSharedState.getBanker();
    const bankerAddress = await banker.ethSigner.getAddress();
    const imxProvider = new GenericIMXProvider(this.providerConfig, sender.ethSigner, sender.starkSigner);

    return await imxProvider.transfer({
      type: 'ETH',
      amount: parseEther(amount).toString(),
      receiver: bankerAddress,
    });
  }

  // @when('{string} creates transfer {string} of {string} NFT to {string}')
  // public async transferNFT(
  //   userVar: string,
  //   transferVar: string,
  //   assetVar: string,
  //   receiverVar: string,
  // ) {
  //   const sender = this.stepSharedState.users[userVar];
  //   const receiver = this.stepSharedState.users[receiverVar];
  //   const receiverAddress = await receiver.ethSigner.getAddress();
  //   const token = this.stepSharedState.nfts[assetVar];

  //   const response = await this.client.transfer(sender, {
  //     type: 'ERC721',
  //     tokenAddress: token.data.token_address,
  //     tokenId: token.data.id,
  //     receiver: receiverAddress,
  //   });

  //   this.stepSharedState.transfers[transferVar] = {
  //     sent_signature: response.sent_signature,
  //     status: response.status,
  //     time: response.time,
  //     transfer_id: response.transfer_id,
  //   };
  // }

  // @when(
  //   '{string} creates batch transfer {string} of {string} NFT to {string}',
  //   undefined,
  //   20000,
  // )
  // public async transferBatchNFT(
  //   userVar: string,
  //   transferVar: string,
  //   assetVar: string,
  //   receiverVar: string,
  // ) {
  //   const sender = this.stepSharedState.users[userVar];
  //   const receiver = this.stepSharedState.users[receiverVar];
  //   const receiverAddress = await receiver.ethSigner.getAddress();
  //   const token = this.stepSharedState.nfts[assetVar];
  //   const response = await this.client.batchNftTransfer(sender, [
  //     {
  //       receiver: receiverAddress,
  //       tokenAddress: token.data.token_address.toLowerCase(),
  //       tokenId: token.data.id,
  //     },
  //   ]);
  //   this.stepSharedState.transferV2[transferVar] = {
  //     transfer_ids: response.transfer_ids,
  //   };
  // }

  // @when('{string} creates transfer {string} of {string} ETH to {string}')
  public async transferETH(
    userVar: string,
    transferVar: string,
    amount: string,
    receiverVar: string,
  ) {
    const sender = this.stepSharedState.users[userVar];
    const receiver = this.stepSharedState.users[receiverVar];
    const receiverAddress = await receiver.ethSigner.getAddress();
    const imxProvider = new GenericIMXProvider(this.providerConfig, sender.ethSigner, sender.starkSigner);

    console.log('receiver address', receiverAddress);
    try {
      const response = await imxProvider.transfer({
        type: 'ETH',
        amount: parseEther(amount).toString(),
        receiver: receiverAddress,
      });
      console.log(response);
      this.stepSharedState.transfers[transferVar] = {
        sent_signature: response.sent_signature,
        status: response.status,
        time: response.time,
        transfer_id: response.transfer_id,
      };
    } catch (error) {
      console.log('error', error);
    }
  }
}
