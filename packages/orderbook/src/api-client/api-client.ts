import {
  BidResult,
  CancelOrdersResult,
  Fee,
  ListBidsResult,
  ListingResult,
  ListListingsResult,
  ListTradeResult,
  OrdersService,
  TradeResult,
} from '../openapi/sdk';
import { FulfillableOrder } from '../openapi/sdk/models/FulfillableOrder';
import { FulfillmentDataRequest } from '../openapi/sdk/models/FulfillmentDataRequest';
import { UnfulfillableOrder } from '../openapi/sdk/models/UnfulfillableOrder';
import { ItemType, SEAPORT_CONTRACT_VERSION_V1_5 } from '../seaport';
import { mapSeaportItemToImmutableItem, mapSeaportOrderTypeToImmutableProtocolDataOrderType } from '../seaport/map-to-immutable-order';
import {
  CreateBidParams,
  CreateListingParams,
  ListBidsParams,
  ListListingsParams,
  ListTradesParams,
} from '../types';

export class ImmutableApiClient {
  constructor(
    private readonly orderbookService: OrdersService,
    private readonly chainName: string,
    private readonly seaportAddress: string,
  ) { }

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

  async getBid(bidId: string): Promise<BidResult> {
    return this.orderbookService.getBid({
      chainName: this.chainName,
      bidId,
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

  async listBids(
    listOrderParams: ListBidsParams,
  ): Promise<ListBidsResult> {
    return this.orderbookService.listBids({
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
      throw new Error('Only one item can be listed for a listing');
    }

    if (orderComponents.consideration.length !== 1) {
      throw new Error('Only one item can be used as currency for a listing');
    }

    if (![ItemType.ERC721, ItemType.ERC1155].includes(orderComponents.offer[0].itemType)) {
      throw new Error('Only ERC721 / ERC1155 tokens can be listed');
    }

    if (![ItemType.NATIVE, ItemType.ERC20].includes(orderComponents.consideration[0].itemType)) {
      throw new Error('Only Native / ERC20 tokens can be used as currency items in a listing');
    }

    return this.orderbookService.createListing({
      chainName: this.chainName,
      requestBody: {
        account_address: orderComponents.offerer,
        buy: orderComponents.consideration.map(mapSeaportItemToImmutableItem),
        fees: makerFees.map((f) => ({
          type: Fee.type.MAKER_ECOSYSTEM,
          amount: f.amount,
          recipient_address: f.recipientAddress,
        })),
        end_at: new Date(
          parseInt(`${orderComponents.endTime.toString()}000`, 10),
        ).toISOString(),
        order_hash: orderHash,
        protocol_data: {
          order_type:
            mapSeaportOrderTypeToImmutableProtocolDataOrderType(orderComponents.orderType),
          zone_address: orderComponents.zone,
          seaport_address: this.seaportAddress,
          seaport_version: SEAPORT_CONTRACT_VERSION_V1_5,
          counter: orderComponents.counter.toString(),
        },
        salt: orderComponents.salt,
        sell: orderComponents.offer.map(mapSeaportItemToImmutableItem),
        signature: orderSignature,
        start_at: new Date(
          parseInt(`${orderComponents.startTime.toString()}000`, 10),
        ).toISOString(),
      },
    });
  }

  async createBid({
    orderHash,
    orderComponents,
    orderSignature,
    makerFees,
  }: CreateBidParams): Promise<BidResult> {
    if (orderComponents.offer.length !== 1) {
      throw new Error('Only one item can be listed for a bid');
    }

    if (orderComponents.consideration.length !== 1) {
      throw new Error('Only one item can be used as currency for a bid');
    }

    if (ItemType.ERC20 !== orderComponents.offer[0].itemType) {
      throw new Error('Only ERC20 tokens can be used as the currency item in a bid');
    }

    if (![ItemType.ERC721, ItemType.ERC1155].includes(orderComponents.consideration[0].itemType)) {
      throw new Error('Only ERC721 / ERC1155 tokens can be bid against');
    }

    return this.orderbookService.createBid({
      chainName: this.chainName,
      requestBody: {
        account_address: orderComponents.offerer,
        buy: orderComponents.consideration.map(mapSeaportItemToImmutableItem),
        fees: makerFees.map((f) => ({
          type: Fee.type.MAKER_ECOSYSTEM,
          amount: f.amount,
          recipient_address: f.recipientAddress,
        })),
        end_at: new Date(
          parseInt(`${orderComponents.endTime.toString()}000`, 10),
        ).toISOString(),
        order_hash: orderHash,
        protocol_data: {
          order_type:
            mapSeaportOrderTypeToImmutableProtocolDataOrderType(orderComponents.orderType),
          zone_address: orderComponents.zone,
          seaport_address: this.seaportAddress,
          seaport_version: SEAPORT_CONTRACT_VERSION_V1_5,
          counter: orderComponents.counter.toString(),
        },
        salt: orderComponents.salt,
        sell: orderComponents.offer.map(mapSeaportItemToImmutableItem),
        signature: orderSignature,
        start_at: new Date(
          parseInt(`${orderComponents.startTime.toString()}000`, 10),
        ).toISOString(),
      },
    });
  }
}
