import {
  ConsiderationItem,
  OrderComponents,
  TipInputItem,
} from '@opensea/seaport-js/lib/types';
import { constants } from 'ethers';
import { ItemType, OrderType } from './constants';
import { ERC721Item, ERC1155Item, Order } from '../openapi/sdk';

export function mapImmutableOrderToSeaportOrderComponents(
  order: Order,
  counter: string,
  zoneAddress: string,
): { orderComponents: OrderComponents, tips: Array<TipInputItem> } {
  const considerationItems: ConsiderationItem[] = order.buy.map((buyItem) => {
    switch (buyItem.type) {
      case 'NATIVE':
        return {
          startAmount: buyItem.amount,
          endAmount: buyItem.amount,
          itemType: ItemType.NATIVE,
          recipient: order.account_address,
          token: constants.AddressZero,
          identifierOrCriteria: '0',
        };
      case 'ERC20':
        return {
          startAmount: buyItem.amount,
          endAmount: buyItem.amount,
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

  const fees: TipInputItem[] = order.fees.map((fee) => ({
    amount: fee.amount,
    itemType:
      order.buy[0].type === 'ERC20' ? ItemType.ERC20 : ItemType.NATIVE,
    recipient: fee.recipient_address,
    token:
      order.buy[0].type === 'ERC20'
        ? order.buy[0].contract_address!
        : constants.AddressZero,
    identifierOrCriteria: '0',
  }));

  return {
    orderComponents: {
      conduitKey: constants.HashZero,
      consideration: [...considerationItems],
      offer: order.sell.map((sellItem) => {
        let tokenItem;
        switch (sellItem.type) {
          case 'ERC1155':
            tokenItem = sellItem as ERC1155Item;
            return {
              startAmount: tokenItem.amount,
              endAmount: tokenItem.amount,
              itemType: ItemType.ERC1155,
              recipient: order.account_address,
              token: tokenItem.contract_address!,
              identifierOrCriteria: tokenItem.token_id,
            };
          default: // ERC721
            tokenItem = sellItem as ERC721Item;
            return {
              startAmount: '1',
              endAmount: '1',
              itemType: ItemType.ERC721,
              recipient: order.account_address,
              token: tokenItem.contract_address!,
              identifierOrCriteria: tokenItem.token_id,
            };
        }
      }),
      counter,
      endTime: Math.round(new Date(order.end_at).getTime() / 1000).toString(),
      startTime: Math.round(
        new Date(order.start_at).getTime() / 1000,
      ).toString(),
      salt: order.salt,
      offerer: order.account_address,
      zone: zoneAddress,
      // this should be the fee exclusive number of items the user signed for
      totalOriginalConsiderationItems: considerationItems.length,
      orderType: order.sell[0].type === 'ERC1155' ? OrderType.PARTIAL_RESTRICTED : OrderType.FULL_RESTRICTED,
      zoneHash: constants.HashZero,
    },
    tips: fees,
  };
}
