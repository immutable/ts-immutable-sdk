import { ConsiderationItem, OfferItem } from '@opensea/seaport-js/lib/types';
import {
  AssetCollectionItem, ERC20Item, Item, ProtocolData,
} from '../openapi/sdk';
import { exhaustiveSwitch } from '../utils';
import { ItemType, OrderType } from './constants';

export function mapSeaportItemToImmutableItem(item: OfferItem | ConsiderationItem): Item {
  switch (item.itemType) {
    case ItemType.NATIVE:
      return {
        type: 'NATIVE',
        amount: item.startAmount,
      };
    case ItemType.ERC20:
      return {
        type: 'ERC20',
        contract_address: item.token,
        amount: item.startAmount,
      };
    case ItemType.ERC721:
      return {
        type: 'ERC721',
        contract_address: item.token,
        token_id: item.identifierOrCriteria,
      };
    case ItemType.ERC1155:
      return {
        type: 'ERC1155',
        contract_address: item.token,
        token_id: item.identifierOrCriteria,
        amount: item.startAmount,
      };
    case ItemType.ERC721_WITH_CRITERIA:
      return {
        type: 'ERC721_COLLECTION',
        contract_address: item.token,
        amount: item.startAmount,
      };
    case ItemType.ERC1155_WITH_CRITERIA:
      return {
        type: 'ERC1155_COLLECTION',
        contract_address: item.token,
        amount: item.startAmount,
      };
    default:
      return exhaustiveSwitch(item.itemType as never);
  }
}

export function mapSeaportItemToImmutableERC20Item(item: OfferItem | ConsiderationItem): ERC20Item {
  if (item.itemType !== ItemType.ERC20) {
    throw new Error(`Expected ERC20 item, got ${item.itemType}`);
  }
  return {
    type: 'ERC20',
    contract_address: item.token,
    amount: item.startAmount,
  };
}

export function mapSeaportItemToImmutableAssetCollectionItem(
  item: OfferItem | ConsiderationItem,
): AssetCollectionItem {
  switch (item.itemType) {
    case ItemType.ERC721_WITH_CRITERIA:
      return {
        type: 'ERC721_COLLECTION',
        contract_address: item.token,
        amount: item.startAmount,
      };
    case ItemType.ERC1155_WITH_CRITERIA:
      return {
        type: 'ERC1155_COLLECTION',
        contract_address: item.token,
        amount: item.startAmount,
      };
    case ItemType.ERC20:
    case ItemType.NATIVE:
    case ItemType.ERC721:
    case ItemType.ERC1155:
      throw new Error(`Unsupported item type ${item.itemType}`);
    default:
      return exhaustiveSwitch(item.itemType as never);
  }
}

export function mapSeaportOrderTypeToImmutableProtocolDataOrderType(ot: OrderType) {
  switch (ot) {
    case OrderType.FULL_RESTRICTED:
      return ProtocolData.order_type.FULL_RESTRICTED;
    case OrderType.PARTIAL_RESTRICTED:
      return ProtocolData.order_type.PARTIAL_RESTRICTED;
    case OrderType.FULL_OPEN:
    case OrderType.PARTIAL_OPEN:
      throw new Error(`Unsupported order type ${ot}`);
    default:
      return exhaustiveSwitch(ot);
  }
}
