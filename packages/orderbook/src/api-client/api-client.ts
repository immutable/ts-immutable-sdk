import {
  Fee,
  ListingResult,
  ListListingsResult,
  ListTradeResult,
  OrdersService,
  ProtocolData,
  TradeResult,
  CancelOrdersResult,
} from '../openapi/sdk';
import {
  CreateListingParams,
  FeeType,
  ListListingsParams,
  ListTradesParams,
} from '../types';
import { FulfillableOrder } from '../openapi/sdk/models/FulfillableOrder';
import { UnfulfillableOrder } from '../openapi/sdk/models/UnfulfillableOrder';
import { FulfillmentDataRequest } from '../openapi/sdk/models/FulfillmentDataRequest';
import { ItemType, SEAPORT_CONTRACT_VERSION_V1_5 } from '../seaport';

export class ImmutableApiClient {
  constructor(
    private readonly orderbookService: OrdersService,
    private readonly chainName: string,
    private readonly seaportAddress: string,
  ) {}

  async fulfillmentData(
    requests: Array<FulfillmentDataRequest>,
  ): Promise<{
      result: {
        fulfillable_orders: Array<FulfillableOrder>;
        unfulfillable_orders: Array<UnfulfillableOrder>;
      };
    }> {
    return this.orderbookService.fulfillmentData({
      chainName: this.chainName,
      requestBody: requests,
    });
  }

  async getListing(listingId: string): Promise<ListingResult> {
    return this.orderbookService.getListing({
      chainName: this.chainName,
      listingId,
    });
  }

  async getTrade(tradeId: string): Promise<TradeResult> {
    return this.orderbookService.getTrade({
      chainName: this.chainName,
      tradeId,
    });
  }

  async listListings(
    listOrderParams: ListListingsParams,
  ): Promise<ListListingsResult> {
    return this.orderbookService.listListings({
      chainName: this.chainName,
      ...listOrderParams,
    });
  }

  async listTrades(
    listTradesParams: ListTradesParams,
  ): Promise<ListTradeResult> {
    return this.orderbookService.listTrades({
      chainName: this.chainName,
      ...listTradesParams,
    });
  }

  async cancelOrders(
    orderIds: string[],
    accountAddress: string,
    signature: string,
  ): Promise<CancelOrdersResult> {
    return this.orderbookService.cancelOrders({
      chainName: this.chainName,
      requestBody: {
        account_address: accountAddress,
        orders: orderIds,
        signature,
      },
    });
  }

  async createListing({
    orderHash,
    orderComponents,
    orderSignature,
    makerFees,
  }: CreateListingParams): Promise<ListingResult> {
    if (orderComponents.offer.length !== 1) {
      throw new Error('Only one item can be listed at a time');
    }

    if (Number(orderComponents.offer[0].itemType) !== ItemType.ERC721
        && Number(orderComponents.offer[0].itemType) !== ItemType.ERC1155) {
      throw new Error('Only ERC721 / ERC1155 tokens can be listed');
    }

    const orderTypes = [
      ...orderComponents.consideration.map((c) => c.itemType),
    ];
    const isSameConsiderationType = new Set(orderTypes).size === 1;
    if (!isSameConsiderationType) {
      throw new Error('All consideration items must be of the same type');
    }

    return this.orderbookService.createListing({
      chainName: this.chainName,
      requestBody: {
        account_address: orderComponents.offerer,
        buy: [
          {
            type:
              Number(orderComponents.consideration[0].itemType)
              === ItemType.NATIVE
                ? 'NATIVE'
                : 'ERC20',
            amount: orderComponents.consideration[0].startAmount,
            contract_address: orderComponents.consideration[0].token,
          },
        ],
        fees: makerFees.map((x) => ({
          amount: x.amount,
          type: FeeType.MAKER_ECOSYSTEM as unknown as Fee.type,
          recipient_address: x.recipientAddress,
        })),
        end_at: new Date(
          parseInt(`${orderComponents.endTime.toString()}000`, 10),
        ).toISOString(),
        order_hash: orderHash,
        protocol_data: {
          order_type: Number(orderComponents.offer[0].itemType) === ItemType.ERC1155
            ? ProtocolData.order_type.PARTIAL_RESTRICTED : ProtocolData.order_type.FULL_RESTRICTED,
          zone_address: orderComponents.zone,
          seaport_address: this.seaportAddress,
          seaport_version: SEAPORT_CONTRACT_VERSION_V1_5,
          counter: orderComponents.counter.toString(),
        },
        salt: orderComponents.salt,
        sell: Number(orderComponents.offer[0].itemType) === ItemType.ERC1155
          ? [{
            contract_address: orderComponents.offer[0].token,
            token_id: orderComponents.offer[0].identifierOrCriteria,
            type: 'ERC1155',
            amount: orderComponents.offer[0].startAmount,
          }] : [{
            contract_address: orderComponents.offer[0].token,
            token_id: orderComponents.offer[0].identifierOrCriteria,
            type: 'ERC721',
          }],
        signature: orderSignature,
        start_at: new Date(
          parseInt(`${orderComponents.startTime.toString()}000`, 10),
        ).toISOString(),
      },
    });
  }
}
