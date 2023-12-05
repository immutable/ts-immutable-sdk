import { UnsignedOrderRequest } from '@imtbl/core-sdk';
import { parseEther } from '@ethersproject/units';
import { ImmutableXClient, ImxClientModuleConfiguration } from '@imtbl/sdk/immutablex_client';
import { GenericIMXProvider, ProviderConfiguration } from '@imtbl/sdk/provider';
import { configuration, StepSharedState } from './stepSharedState';

// @binding([StepSharedState])
export class Order {
  constructor(protected stepSharedState: StepSharedState) {}

  config: ImxClientModuleConfiguration = {
    baseConfig: { environment: configuration.environment },
  };

  providerConfig = new ProviderConfiguration({
    baseConfig: configuration,
  });

  client = new ImmutableXClient(this.config);

  // @when(
  //   '{string} creates sell order {string} of {string} NFT for sell for {string} eth',
  //   undefined,
  //   30000,
  // )
  public async createNFTSellOrder(
    makerVar: string,
    orderVar: string,
    assetVar: string,
    amount: string,
  ) {
    try {
      const seller = this.stepSharedState.users[makerVar];
      const token = this.stepSharedState.nfts[assetVar];
      const order: UnsignedOrderRequest = {
        sell: {
          tokenAddress: token.data.token_address,
          tokenId: token.data.id,
          type: 'ERC721',
        },
        buy: {
          type: 'ETH',
          amount: parseEther(amount).toString(),
        },
        fees: [],
      };

      const provider = new GenericIMXProvider(this.providerConfig, seller.ethSigner, seller.starkSigner);
      const createOrderResponse = await provider.createOrder(order);

      this.stepSharedState.orders[orderVar] = {
        ...order,
        orderId: createOrderResponse.order_id!,
      };
    } catch (err) {
      console.log('err', err);
      throw err;
    }
  }

  // @when('{string} cancels sell order {string}', undefined, 30000)
  public async cancelNFTSellOrder(
    sellerVar: string,
    sellOrderVar: string,
  ) {
    const seller = this.stepSharedState.users[sellerVar];
    const order = this.stepSharedState.orders[sellOrderVar];
    const provider = new GenericIMXProvider(this.providerConfig, seller.ethSigner, seller.starkSigner);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    await provider.cancelOrder({ order_id: order.orderId });
  }
}
