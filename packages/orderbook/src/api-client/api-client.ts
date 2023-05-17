import { ItemType } from '@opensea/seaport-js/lib/constants';
import {
  BuyItem, Fee, Order, OrderBookClient, ProtocolData, SellItem,
} from 'openapi/sdk';
import { CreateOrderParams } from 'types';

export class ImmutableApiClient {
  constructor(
    private readonly orderbookClient: OrderBookClient,
    private readonly chainId: string,
  ) {}

  async getOrder(orderId: string): Promise<Order> {
    return this.orderbookClient.orderBook.orderBookGetOrder({ chainId: this.chainId, orderId });
  }

  async createOrder(
    {
      orderHash, orderComponents, offerer, orderSignature,
    }: CreateOrderParams,
  ): Promise<Order> {
    // TODO: Add validation
    return this.orderbookClient.orderBook.orderBookCreateOrder({
      chainId: this.chainId,
      requestBody: {
        order_hash: orderHash,
        account_address: offerer,
        buy: [
          {
            item_type: orderComponents.consideration[0].itemType === ItemType.NATIVE
              ? BuyItem.item_type.IMX
              : BuyItem.item_type.ERC20,
            start_amount: orderComponents.consideration[0].startAmount,
          }],
        buy_fees: orderComponents.consideration.length > 1
          ? [
            {
              amount: orderComponents.consideration[1].startAmount,
              recipient: orderComponents.consideration[1].recipient,
              fee_type: Fee.fee_type.ROYALTY,
            },
          ]
          : [],
        end_time: new Date(parseInt(`${orderComponents.endTime.toString()}000`, 10)).toISOString(),
        protocol_data: {
          order_type: ProtocolData.order_type.FULL_OPEN,
        },
        salt: orderComponents.salt,
        sell: [{
          contract_address: orderComponents.offer[0].token,
          token_id: orderComponents.offer[0].identifierOrCriteria,
          item_type: SellItem.item_type.ERC721,
        }],
        signature: orderSignature,
        start_time: new Date(parseInt(`${orderComponents.startTime.toString()}000`, 10)).toISOString(),
      },
    });
  }
}
