import type {
  ConsiderationItem,
  OfferItem,
  OrderComponents,
} from '@opensea/seaport-js/lib/types';
import { toBeHex } from 'ethers';
import { getBulkOrderTree } from './lib/bulk-orders';
import { ItemType, OrderType } from './constants';

function orderTypeStringToEnum(orderTypeString: string): OrderType {
  if (
    [
      OrderType.FULL_OPEN,
      OrderType.PARTIAL_OPEN,
      OrderType.FULL_RESTRICTED,
      OrderType.PARTIAL_RESTRICTED,
    ].includes(Number(orderTypeString))
  ) {
    return Number(orderTypeString);
  }

  throw new Error(`Unknown order type ${orderTypeString}`);
}

function itemTypeStringToEnum(itemTypeString: string): ItemType {
  if (
    [
      ItemType.NATIVE,
      ItemType.ERC20,
      ItemType.ERC721,
      ItemType.ERC1155,
      ItemType.ERC721_WITH_CRITERIA,
      ItemType.ERC1155_WITH_CRITERIA,
    ].includes(Number(itemTypeString))
  ) {
    return Number(itemTypeString);
  }

  throw new Error(`Unknown item type ${itemTypeString}`);
}

interface OrderComponentsMessage
  extends Omit<OrderComponents, 'orderType' | 'offer' | 'consideration'> {
  orderType: string;
  offer: (Omit<OfferItem, 'itemType'> & { itemType: string })[];
  consideration: (Omit<ConsiderationItem, 'itemType'> & { itemType: string })[];
}

export function getOrderComponentsFromMessage(
  orderMessage: string,
): OrderComponents {
  const data = JSON.parse(orderMessage);
  const message = data.message as OrderComponentsMessage;

  return {
    ...message,
    orderType: orderTypeStringToEnum(message.orderType),
    salt: toBeHex(BigInt(message.salt)),
    offer: message.offer.map(
      (i): OfferItem => ({
        ...i,
        itemType: itemTypeStringToEnum(i.itemType),
      }),
    ),
    consideration: message.consideration.map(
      (i): ConsiderationItem => ({
        ...i,
        itemType: itemTypeStringToEnum(i.itemType),
      }),
    ),
  };
}

export function getBulkOrderComponentsFromMessage(orderMessage: string): {
  components: OrderComponents[];
  types: any;
  value: any;
} {
  const data = JSON.parse(orderMessage);
  const orderComponents: OrderComponents[] = (data.message.tree as OrderComponentsMessage[])
    .flat(Infinity)
    // Filter off the zero nodes in the tree. The will get rebuilt bu `getBulkOrderTree`
    // when creating the listings
    .filter((o) => o.offerer !== '0x0000000000000000000000000000000000000000')
    .map((orderComponentMessage): OrderComponents => ({
      ...orderComponentMessage,
      orderType: orderTypeStringToEnum(orderComponentMessage.orderType),
      salt: toBeHex(BigInt(orderComponentMessage.salt)),
      offer: orderComponentMessage.offer.map(
        (i): OfferItem => ({
          ...i,
          itemType: itemTypeStringToEnum(i.itemType),
        }),
      ),
      consideration: orderComponentMessage.consideration.map(
        (i): ConsiderationItem => ({
          ...i,
          itemType: itemTypeStringToEnum(i.itemType),
        }),
      ),
    }));

  return {
    components: orderComponents,
    types: data.types,
    value: data.message,
  };
}

export function getBulkSeaportOrderSignatures(
  signature: string,
  orderComponents: OrderComponents[],
): string[] {
  const tree = getBulkOrderTree(orderComponents);
  return orderComponents.map((_, i) => tree.getEncodedProofAndSignature(i, signature));
}
