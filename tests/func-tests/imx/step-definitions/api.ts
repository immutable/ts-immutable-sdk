import { strict as assert } from 'assert';
import {
  IMXClient,
  ImxModuleConfiguration,
  ProviderConfiguration,
} from '@imtbl/sdk/x';
import { configuration, StepSharedState } from './stepSharedState';
import { env, getProvider, repeatCheck20 } from '../common';
import { parseEther } from 'ethers';

// @binding([StepSharedState])
export class Trading {
  constructor(protected stepSharedState: StepSharedState) {}

  config: ImxModuleConfiguration = {
    baseConfig: { environment: configuration.environment },
  };

  provider = getProvider(env.network, env.alchemyApiKey);

  providerConfig = new ProviderConfiguration({
    baseConfig: configuration,
  });

  client = new IMXClient(this.config);

  // @then('api should show that {string} owns the NFT {string}', undefined, 20000)
  // public async checkOwnership(ownerVar: string, assetVar: string) {
  //   const owner = this.stepSharedState.users[ownerVar];
  //   const ownerAddress = await owner.ethSigner.getAddress();
  //   const token = this.stepSharedState.nfts[assetVar];

  //   await repeatCheck20(async () => {
  //     const asset = await this.client.getAsset({
  //       tokenAddress: token.data.token_address,
  //       tokenId: token.data.id,
  //     });
  //     assert.equal(asset.user, ownerAddress.toLowerCase());
  //   });
  // }

  // @then(
  //   'api should show that NFT {string} status is {string}',
  //   undefined,
  //   5 * 60 * 1000,
  // )
  public async checkAssetStatus(assetVar: string, status: string) {
    const token = this.stepSharedState.nfts[assetVar];
    await repeatCheck20(async () => {
      const asset = await this.client.getAsset({
        tokenAddress: token.data.token_address,
        tokenId: token.data.id,
      });
      assert.equal(asset.status, status);
    });
  }

  // @then(
  //   'api should show that {string} balance is {string} ETH',
  //   undefined,
  //   5 * 60 * 1000,
  // )
  public async checkUserBalance(userVar: string, amount: string) {
    const user = this.stepSharedState.users[userVar];
    await repeatCheck20(async () => {
      const owner = await user.ethSigner.getAddress();
      const result = await this.client.getBalance({
        owner,
        address: 'eth',
      });
      // TODO update code gen of API Spec
      assert.equal(
        // @ts-ignore
        result.balance.toString(),
        parseEther(amount).toString(),
      );
    });
  }

  // @then('transfer {string} should be available through api')
  public async checkTransfer(transferVar: string) {
    const transfer = this.stepSharedState.transfers[transferVar];
    console.log(`check transfer: ${transfer.transfer_id}`);
    await repeatCheck20(async () => {
      const transferDetails = await this.client.getTransfer({
        id: transfer.transfer_id!.toString(),
      });
      assert.equal(transferDetails.transaction_id, transfer.transfer_id);
    });
  }

  // @then(
  //   'batch transfer {string} should be available through api',
  //   undefined,
  //   5 * 60 * 1000,
  // )
  // public async checkBatchTransfer(transferVar: string) {
  //   const transfer = this.stepSharedState.transferV2[transferVar];
  //   console.log(`check transfer: ${transfer.transfer_ids}`);
  //   await repeatCheck20(async () => {
  //     const transferDetails = await this.client.getTransfer({
  //       id: transfer.transfer_ids![0].toString(),
  //     });
  //     assert.equal(transferDetails.transaction_id, transfer.transfer_ids![0]);
  //   });
  // }

  // @then(
  //   'burn {string} should be available through api',
  //   undefined,
  //   5 * 60 * 1000,
  // )
  public async checkBurn(burnVar: string) {
    const burn = this.stepSharedState.burns[burnVar];
    console.log(`check burn: ${burn.transfer_id}`);
    await repeatCheck20(async () => {
      const burnDetails = await this.client.getTransfer({
        id: burn.transfer_id!.toString(),
      });
      assert.equal(burnDetails.transaction_id, burn.transfer_id);
    });
  }

  // @then(
  //   'order {string} should be available through api',
  //   undefined,
  //   5 * 60 * 1000,
  // )
  // public async checkOrder(orderVar: string) {
  //   const order = this.stepSharedState.orders[orderVar];
  //   console.log(`check order: ${order.orderId}`);
  //   await repeatCheck20(async () => {
  //     const orderDetails = await this.client.getOrderV3({
  //       id: order.orderId.toString(),
  //     });
  //     assert.equal(orderDetails.order_id, order.orderId);
  //   });
  // }

  // @then('api should show that order {string} status is {string}')
  public async checkOrderStatus(orderVar: string, status: string) {
    const order = this.stepSharedState.orders[orderVar];
    console.log(`check order: ${order.orderId}`);
    await repeatCheck20(
      async () => {
        const orderDetails = await this.client.getOrder({
          id: order.orderId.toString(),
        });
        console.log(
          `check Details Status: ${orderDetails.status}`,
          `Status Input: ${status}`,
        );
        return orderDetails;
      },
      // eslint-disable-next-line @typescript-eslint/no-shadow
      (order) => order.status === status,
    );
  }

  // @then(
  //   'api should show that asset {string} belongs to banker',
  //   undefined,
  //   5 * 60 * 1000,
  // )
  // public async checkAssetOwnership(assetVar: string) {
  //   const asset = this.stepSharedState.nfts[assetVar];
  //   const assetId = asset.data.id;
  //   const banker = await this.stepSharedState.getBanker();
  //   const bankerAddress = await banker.ethSigner.getAddress();
  //   console.log(`check asset: ${assetId}`);
  //   await repeatCheck20(
  //     async () => {
  //       const assetDetails = await this.client.getAsset({
  //         tokenId: assetId,
  //         tokenAddress: asset.data.token_address,
  //       });
  //       console.log(`checking owner of asset: ${assetId}`);
  //       return assetDetails;
  //     },
  //     assetResponse => assetResponse.user! === bankerAddress.toLowerCase(),
  //   );
  // }

  // @then(
  //   'trade {string} should be available through api',
  //   undefined,
  //   5 * 60 * 1000,
  // )
  // public async checkTrade(transferVar: string) {
  //   const trade = this.stepSharedState.trades[transferVar];
  //   console.log(`check trade: ${trade.tradeId}`);
  //   await repeatCheck20(async () => {
  //     const tradeDetails = await this.client.getTrade({
  //       id: trade.tradeId.toString(),
  //     });
  //     assert.equal(tradeDetails.transaction_id, trade.tradeId);
  //   });
  // }
}
