import {
  BidResult,
  CancelOrdersResult,
  CollectionBidResult,
  Fee,
  ListBidsResult,
  ListCollectionBidsResult,
  ListingResult,
  ListListingsResult,
  ListMetadataBidsResult,
  ListTradeResult,
  ListTraitBidsResult,
  MetadataBidResult,
  OrdersService,
  TradeResult,
  TraitBidResult,
} from '../openapi/sdk';
import { FulfillableOrder } from '../openapi/sdk/models/FulfillableOrder';
import { FulfillmentDataRequest } from '../openapi/sdk/models/FulfillmentDataRequest';
import { UnfulfillableOrder } from '../openapi/sdk/models/UnfulfillableOrder';
import { ItemType, SEAPORT_CONTRACT_VERSION_V1_5 } from '../seaport';
import {
  mapSeaportItemToImmutableAssetCollectionItem,
  mapSeaportItemToImmutableERC20Item,
  mapSeaportItemToImmutableItem,
  mapSeaportOrderTypeToImmutableProtocolDataOrderType,
} from '../seaport/map-to-immutable-order';
import {
  CreateBidParams,
  CreateCollectionBidParams,
  CreateListingParams,
  CreateMetadataBidParams,
  CreateTraitBidParams,
  ListBidsParams,
  ListCollectionBidsParams,
  ListListingsParams,
  ListMetadataBidsParams,
  ListTraitBidsParams,
  ListTradesParams,
  MetadataAttributeField,
  MetadataFieldFilter,
  MetadataFieldName,
  MetadataTopLevelField,
} from '../types';

const METADATA_TOP_LEVEL_FIELDS = new Set<MetadataTopLevelField>([
  'name',
  'image',
  'description',
  'animation_url',
  'external_url',
  'youtube_url',
]);

const METADATA_ATTRIBUTE_PREFIX = 'attribute:';

const KNOWN_METADATA_FIELD_NAMES_DESCRIPTION = 'name, image, description, animation_url, '
  + 'external_url, youtube_url, or "attribute:<trait_type>"';

function isAttributeField(fieldName: string): fieldName is MetadataAttributeField {
  return fieldName.startsWith(METADATA_ATTRIBUTE_PREFIX)
    && fieldName.length > METADATA_ATTRIBUTE_PREFIX.length;
}

function isKnownMetadataFieldName(fieldName: string): fieldName is MetadataFieldName {
  return METADATA_TOP_LEVEL_FIELDS.has(fieldName as MetadataTopLevelField)
    || isAttributeField(fieldName);
}

/**
 * Validates client-side rules for metadata bid criteria before sending to the
 * API. The API performs the same checks server-side; this validation is here
 * to give callers a clear, immediate error.
 */
function validateMetadataCriteria(criteria: MetadataFieldFilter[]): void {
  if (criteria.length === 0) {
    throw new Error('metadataCriteria must contain at least one filter');
  }

  const seenFieldNames = new Set<string>();
  criteria.forEach((filter) => {
    if (!filter.fieldName) {
      throw new Error('metadataCriteria entries must have a non-empty fieldName');
    }
    if (!isKnownMetadataFieldName(filter.fieldName)) {
      throw new Error(
        `metadataCriteria fieldName "${filter.fieldName}" must be one of `
        + `${KNOWN_METADATA_FIELD_NAMES_DESCRIPTION}`,
      );
    }
    if (!filter.values || filter.values.length === 0) {
      throw new Error(
        `metadataCriteria filter "${filter.fieldName}" must have at least one value`,
      );
    }
    if (seenFieldNames.has(filter.fieldName)) {
      throw new Error(
        `metadataCriteria contains duplicate fieldName "${filter.fieldName}"; `
        + 'use a single filter per field with multiple values instead',
      );
    }
    seenFieldNames.add(filter.fieldName);
  });
}

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

  async getCollectionBid(collectionBidId: string): Promise<CollectionBidResult> {
    return this.orderbookService.getCollectionBid({
      chainName: this.chainName,
      collectionBidId,
    });
  }

  async getTraitBid(traitBidId: string): Promise<TraitBidResult> {
    return this.orderbookService.getTraitBid({
      chainName: this.chainName,
      traitBidId,
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

  async listCollectionBids(
    listOrderParams: ListCollectionBidsParams,
  ): Promise<ListCollectionBidsResult> {
    return this.orderbookService.listCollectionBids({
      chainName: this.chainName,
      ...listOrderParams,
    });
  }

  async listTraitBids(
    listOrderParams: ListTraitBidsParams,
  ): Promise<ListTraitBidsResult> {
    return this.orderbookService.listTraitBids({
      chainName: this.chainName,
      ...listOrderParams,
    });
  }

  async getMetadataBid(metadataBidId: string): Promise<MetadataBidResult> {
    return this.orderbookService.getMetadataBid({
      chainName: this.chainName,
      metadataBidId,
    });
  }

  async listMetadataBids(
    listOrderParams: ListMetadataBidsParams,
  ): Promise<ListMetadataBidsResult> {
    return this.orderbookService.listMetadataBids({
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
        sell: orderComponents.offer.map(mapSeaportItemToImmutableERC20Item),
        signature: orderSignature,
        start_at: new Date(
          parseInt(`${orderComponents.startTime.toString()}000`, 10),
        ).toISOString(),
      },
    });
  }

  async createCollectionBid({
    orderHash,
    orderComponents,
    orderSignature,
    makerFees,
  }: CreateCollectionBidParams): Promise<CollectionBidResult> {
    if (orderComponents.offer.length !== 1) {
      throw new Error('Only one item can be listed for a collection bid');
    }

    if (orderComponents.consideration.length !== 1) {
      throw new Error('Only one item can be used as currency for a collection bid');
    }

    if (ItemType.ERC20 !== orderComponents.offer[0].itemType) {
      throw new Error('Only ERC20 tokens can be used as the currency item in a collection bid');
    }

    if (![ItemType.ERC721_WITH_CRITERIA, ItemType.ERC1155_WITH_CRITERIA]
      .includes(orderComponents.consideration[0].itemType)
    ) {
      throw new Error('Only ERC721 / ERC1155 collection based tokens can be bid against');
    }

    return this.orderbookService.createCollectionBid({
      chainName: this.chainName,
      requestBody: {
        account_address: orderComponents.offerer,
        buy: orderComponents.consideration.map(mapSeaportItemToImmutableAssetCollectionItem),
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
        sell: orderComponents.offer.map(mapSeaportItemToImmutableERC20Item),
        signature: orderSignature,
        start_at: new Date(
          parseInt(`${orderComponents.startTime.toString()}000`, 10),
        ).toISOString(),
      },
    });
  }

  async createMetadataBid(params: CreateMetadataBidParams): Promise<MetadataBidResult> {
    const {
      orderHash,
      orderComponents,
      orderSignature,
      makerFees,
      metadataId,
      metadataCriteria,
    } = params;

    if (orderComponents.offer.length !== 1) {
      throw new Error('Only one item can be listed for a metadata bid');
    }

    if (orderComponents.consideration.length !== 1) {
      throw new Error('Only one item can be used as currency for a metadata bid');
    }

    if (ItemType.ERC20 !== orderComponents.offer[0].itemType) {
      throw new Error('Only ERC20 tokens can be used as the currency item in a metadata bid');
    }

    if (![ItemType.ERC721_WITH_CRITERIA, ItemType.ERC1155_WITH_CRITERIA]
      .includes(orderComponents.consideration[0].itemType)
    ) {
      throw new Error('Only ERC721 / ERC1155 collection based tokens can be bid against');
    }

    const hasMetadataId = !!metadataId;
    const hasMetadataCriteria = !!metadataCriteria && metadataCriteria.length > 0;
    if (hasMetadataId && hasMetadataCriteria) {
      throw new Error(
        'Exactly one of metadataId or metadataCriteria must be provided, not both',
      );
    }
    if (!hasMetadataId && !hasMetadataCriteria) {
      throw new Error('Exactly one of metadataId or metadataCriteria must be provided');
    }
    if (hasMetadataCriteria) {
      validateMetadataCriteria(metadataCriteria);
    }

    return this.orderbookService.createMetadataBid({
      chainName: this.chainName,
      requestBody: {
        account_address: orderComponents.offerer,
        buy: orderComponents.consideration.map(mapSeaportItemToImmutableAssetCollectionItem),
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
        sell: orderComponents.offer.map(mapSeaportItemToImmutableERC20Item),
        signature: orderSignature,
        start_at: new Date(
          parseInt(`${orderComponents.startTime.toString()}000`, 10),
        ).toISOString(),
        metadata_id: hasMetadataId ? metadataId : undefined,
        metadata_criteria: hasMetadataCriteria
          ? metadataCriteria.map((c) => ({ field_name: c.fieldName, values: c.values }))
          : undefined,
      },
    });
  }

  async createTraitBid({
    orderHash,
    orderComponents,
    orderSignature,
    makerFees,
    traitCriteria,
  }: CreateTraitBidParams): Promise<TraitBidResult> {
    if (orderComponents.offer.length !== 1) {
      throw new Error('Only one item can be listed for a trait bid');
    }

    if (orderComponents.consideration.length !== 1) {
      throw new Error('Only one item can be used as currency for a trait bid');
    }

    if (ItemType.ERC20 !== orderComponents.offer[0].itemType) {
      throw new Error('Only ERC20 tokens can be used as the currency item in a trait bid');
    }

    if (![ItemType.ERC721_WITH_CRITERIA, ItemType.ERC1155_WITH_CRITERIA]
      .includes(orderComponents.consideration[0].itemType)
    ) {
      throw new Error('Only ERC721 / ERC1155 collection based tokens can be bid against');
    }

    if (!traitCriteria?.length) {
      throw new Error('At least one trait criterion is required for a trait bid');
    }

    return this.orderbookService.createTraitBid({
      chainName: this.chainName,
      requestBody: {
        account_address: orderComponents.offerer,
        buy: orderComponents.consideration.map(mapSeaportItemToImmutableAssetCollectionItem),
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
        sell: orderComponents.offer.map(mapSeaportItemToImmutableERC20Item),
        signature: orderSignature,
        start_at: new Date(
          parseInt(`${orderComponents.startTime.toString()}000`, 10),
        ).toISOString(),
        trait_criteria: traitCriteria.map((c) => ({
          trait_type: c.traitType,
          values: c.values,
        })),
      },
    });
  }
}
