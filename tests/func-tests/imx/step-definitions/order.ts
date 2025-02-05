import {
  IMXClient,
  ImxModuleConfiguration,
  GenericIMXProvider,
  ProviderConfiguration,
  UnsignedOrderRequest,
} from '@imtbl/sdk/x';
import { configuration, StepSharedState } from './stepSharedState';
import { parseEther } from 'ethers';

// @binding([StepSharedState])
export class Order {
  constructor(protected stepSharedState: StepSharedState) { }

  config: ImxModuleConfiguration = {
    baseConfig: { environment: configuration.environment },
  };

  providerConfig = new ProviderConfiguration({
    baseConfig: configuration,
  });

  client = new IMXClient(this.config);

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

      const imxProvider = new GenericIMXProvider(this.providerConfig, seller.ethSigner, seller.starkSigner);
      const createOrderResponse = await imxProvider.createOrder(order);

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
    const imxProvider = new GenericIMXProvider(this.providerConfig, seller.ethSigner, seller.starkSigner);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    await imxProvider.cancelOrder({ order_id: order.orderId });
  }
}
