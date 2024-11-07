import {
  ConsiderationItem,
  OfferItem,
  OrderComponents,
  TipInputItem,
} from '@opensea/seaport-js/lib/types';
import { Item, Order, ProtocolData } from '../openapi/sdk';
import { exhaustiveSwitch } from '../utils';
import { ItemType, OrderType } from './constants';
import { ZeroAddress, ZeroHash } from 'ethers';

function mapImmutableItemToSeaportOfferItem(item: Item): OfferItem {
  switch (item.type) {
    case 'NATIVE':
      throw new Error('NATIVE items are not supported in the offer');
    case 'ERC20':
      return {
        itemType: ItemType.ERC20,
        token: item.contract_address,
        identifierOrCriteria: '0',
        startAmount: item.amount,
        endAmount: item.amount,
      };
    case 'ERC721':
      return {
        itemType: ItemType.ERC721,
        token: item.contract_address,
        identifierOrCriteria: item.token_id,
        startAmount: '1',
        endAmount: '1',
      };
    case 'ERC1155':
      return {
        itemType: ItemType.ERC1155,
        token: item.contract_address,
        identifierOrCriteria: item.token_id,
        startAmount: item.amount,
        endAmount: item.amount,
      };
    case 'ERC721_COLLECTION':
      throw new Error('ERC721_COLLECTION items are not supported in the offer');
    case 'ERC1155_COLLECTION':
      throw new Error('ERC1155_COLLECTION items are not supported in the offer');
    default:
      return exhaustiveSwitch(item);
  }
}

function mapImmutableItemToSeaportConsiderationItem(
  item: Item,
  recipient: string,
): ConsiderationItem {
  switch (item.type) {
    case 'NATIVE':
      return {
        itemType: ItemType.NATIVE,
        startAmount: item.amount,
        endAmount: item.amount,
        token: ZeroAddress,
        identifierOrCriteria: '0',
        recipient,
      };
    case 'ERC20':
      return {
        itemType: ItemType.ERC20,
        startAmount: item.amount,
        endAmount: item.amount,
        token: item.contract_address,
        identifierOrCriteria: '0',
        recipient,
      };
    case 'ERC721':
      return {
        itemType: ItemType.ERC721,
        startAmount: '1',
        endAmount: '1',
        token: item.contract_address,
        identifierOrCriteria: item.token_id,
        recipient,
      };
    case 'ERC1155':
      return {
        itemType: ItemType.ERC1155,
        startAmount: item.amount,
        endAmount: item.amount,
        token: item.contract_address,
        identifierOrCriteria: item.token_id,
        recipient,
      };
    case 'ERC721_COLLECTION':
      return {
        itemType: ItemType.ERC721_WITH_CRITERIA,
        startAmount: item.amount,
        endAmount: item.amount,
        token: item.contract_address,
        identifierOrCriteria: '0',
        recipient,
      };
    case 'ERC1155_COLLECTION':
      return {
        itemType: ItemType.ERC1155_WITH_CRITERIA,
        startAmount: item.amount,
        endAmount: item.amount,
        token: item.contract_address,
        identifierOrCriteria: '0',
        recipient,
      };
    default:
      return exhaustiveSwitch(item);
  }
}

export function mapImmutableOrderToSeaportOrderComponents(
  order: Order,
): { orderComponents: OrderComponents, tips: Array<TipInputItem> } {
  const offerItems: OfferItem[] = order.sell.map(mapImmutableItemToSeaportOfferItem);
  // eslint-disable-next-line max-len
  const considerationItems: ConsiderationItem[] = order.buy.map((item): ConsiderationItem => mapImmutableItemToSeaportConsiderationItem(item, order.account_address));

  // eslint-disable-next-line func-names
  const currencyItem = (function (ot: Order.type): OfferItem | ConsiderationItem {
    switch (ot) {
      case Order.type.LISTING:
        return considerationItems[0];
      case Order.type.BID:
      case Order.type.COLLECTION_BID:
        return offerItems[0];
      default:
        return exhaustiveSwitch(ot);
    }
  }(order.type));

  // eslint-disable-next-line func-names
  const seaportOrderType = (function (ot: ProtocolData.order_type): OrderType {
    switch (ot) {
      case ProtocolData.order_type.FULL_RESTRICTED:
        return OrderType.FULL_RESTRICTED;
      case ProtocolData.order_type.PARTIAL_RESTRICTED:
        return OrderType.PARTIAL_RESTRICTED;
      default:
        return exhaustiveSwitch(ot);
    }
  }(order.protocol_data.order_type));

  const fees: TipInputItem[] = order.fees.map((fee) => ({
    amount: fee.amount,
    itemType: currencyItem.itemType,
    recipient: fee.recipient_address,
    token: currencyItem.token,
    identifierOrCriteria: currencyItem.identifierOrCriteria,
  }));

  return {
    orderComponents: {
      offerer: order.account_address,
      zone: order.protocol_data.zone_address,
      offer: offerItems,
      consideration: considerationItems,
      orderType: seaportOrderType,
      startTime: Math.round(
        new Date(order.start_at).getTime() / 1000,
      ).toString(),
      endTime: Math.round(new Date(order.end_at).getTime() / 1000).toString(),
      zoneHash: ZeroHash,
      salt: order.salt,
      conduitKey: ZeroHash,
      counter: order.protocol_data.counter,
      // this should be the fee exclusive number of items the user signed for
      totalOriginalConsiderationItems: considerationItems.length,
    },
    tips: fees,
  };
}
