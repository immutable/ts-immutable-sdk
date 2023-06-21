import {
  ConsiderationItem,
  OrderComponents,
} from '@opensea/seaport-js/lib/types';
import { ERC721Item, Order } from 'openapi/sdk';
import { constants } from 'ethers';
import { ItemType, OrderType } from './constants';

export function mapImmutableOrderToSeaportOrderComponents(
  order: Order,
  counter: string,
  zoneAddress: string,
): OrderComponents {
  const considerationItems: ConsiderationItem[] = order.buy.map((buyItem) => {
    switch (buyItem.item_type) {
      case 'NATIVE':
        return {
          startAmount: buyItem.start_amount,
          endAmount: buyItem.start_amount,
          itemType: ItemType.NATIVE,
          recipient: order.account_address,
          token: constants.AddressZero,
          identifierOrCriteria: '0',
        };
      case 'ERC20':
        return {
          startAmount: buyItem.start_amount,
          endAmount: buyItem.start_amount,
          itemType: ItemType.ERC20,
          recipient: order.account_address,
          token: buyItem.contract_address! || constants.AddressZero,
          identifierOrCriteria: '0',
        };
      default: // ERC721
        return {
          startAmount: '1',
          endAmount: '1',
          itemType: ItemType.ERC721,
          recipient: order.account_address,
          token: buyItem.contract_address! || constants.AddressZero,
          identifierOrCriteria: '0',
        };
    }
  });

  const fees: ConsiderationItem[] = order.buy_fees.map((fee) => ({
    startAmount: fee.amount,
    endAmount: fee.amount,
    itemType:
      order.buy[0].item_type === 'ERC20' ? ItemType.ERC20 : ItemType.NATIVE,
    recipient: fee.recipient,
    token:
      order.buy[0].item_type === 'ERC20'
        ? order.buy[0].contract_address!
        : constants.AddressZero,
    identifierOrCriteria: '0',
  }));

  return {
    conduitKey: constants.HashZero,
    consideration: [...considerationItems, ...fees],
    offer: order.sell.map((sellItem) => {
      const erc721Item = sellItem as ERC721Item;
      return {
        startAmount: '1',
        endAmount: '1',
        itemType: ItemType.ERC721,
        token: erc721Item.contract_address!,
        identifierOrCriteria: erc721Item.token_id,
      };
    }),
    counter,
    endTime: Math.round(new Date(order.end_time).getTime() / 1000).toString(),
    startTime: Math.round(
      new Date(order.start_time).getTime() / 1000,
    ).toString(),
    salt: order.salt,
    offerer: order.account_address,
    zone: zoneAddress,
    totalOriginalConsiderationItems: 2,
    orderType: OrderType.FULL_RESTRICTED,
    zoneHash: constants.HashZero,
  };
}
