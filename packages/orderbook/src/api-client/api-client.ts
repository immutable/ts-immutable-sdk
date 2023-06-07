import {
  BuyItem,
  Fee,
  OrdersService,
  CreateOrderProtocolData,
  SellItem,
  ListOrdersResult,
  OrderResult,
} from 'openapi/sdk';
import { CreateOrderParams, ListOrderParams } from 'types';
import { ItemType } from '../seaport';

export class ImmutableApiClient {
  constructor(
    private readonly orderbookService: OrdersService,
    private readonly chainId: string,
  ) {}

  async getOrder(orderId: string): Promise<OrderResult> {
    return this.orderbookService.getOrder({ chainId: this.chainId, orderId });
  }

  async listOrders(listOrderParams: ListOrderParams): Promise<ListOrdersResult> {
    return this.orderbookService.listOrders({
      chainId: this.chainId,
      ...listOrderParams,
    });
  }

  async createOrder(
    {
      orderHash, orderComponents, offerer, orderSignature,
    }: CreateOrderParams,
  ): Promise<OrderResult> {
    if (orderComponents.offer.length !== 1) {
      throw new Error('Only one item can be listed at a time');
    }

    if (Number(orderComponents.offer[0].itemType) !== ItemType.ERC721) {
      throw new Error('Only ERC721 tokens can be listed');
    }

    const considerationItemTypeTheSame = new Set(
      [...orderComponents.consideration.map((c) => c.itemType)],
    ).size === 1;
    if (!considerationItemTypeTheSame) {
      throw new Error('All consideration items must be of the same type');
    }

    return this.orderbookService.createOrder({
      chainId: this.chainId,
      requestBody: {
        order_hash: orderHash,
        account_address: offerer,
        buy: [
          {
            item_type: Number(orderComponents.consideration[0].itemType) === ItemType.NATIVE
              ? BuyItem.item_type.NATIVE
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
          order_type: CreateOrderProtocolData.order_type.FULL_RESTRICTED,
          zone_address: orderComponents.zone,
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
