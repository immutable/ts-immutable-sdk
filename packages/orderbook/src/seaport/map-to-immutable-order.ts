import { ConsiderationItem, OfferItem } from '@opensea/seaport-js/lib/types';
import { ItemType, OrderType } from '@opensea/seaport-js/lib/constants';
import { Item, ProtocolData } from '../openapi/sdk';
import { exhaustiveSwitch } from '../utils';

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
      return exhaustiveSwitch(item.itemType);
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
