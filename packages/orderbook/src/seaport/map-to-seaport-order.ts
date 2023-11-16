import {
  ConsiderationItem,
  OrderComponents,
  TipInputItem,
} from '@opensea/seaport-js/lib/types';
import { constants } from 'ethers';
import { ItemType, OrderType } from './constants';
import { ERC721Item, Order } from '../openapi/sdk';

export function mapImmutableOrderToSeaportOrderComponents(
  order: Order,
  counter: string,
  zoneAddress: string,
): { orderComponents: OrderComponents, tips: Array<TipInputItem> } {
  const considerationItems: ConsiderationItem[] = order.buy.map((buyItem) => {
    switch (buyItem.item_type) {
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
      order.buy[0].item_type === 'ERC20' ? ItemType.ERC20 : ItemType.NATIVE,
    recipient: fee.recipient,
    token:
      order.buy[0].item_type === 'ERC20'
        ? order.buy[0].contract_address!
        : constants.AddressZero,
    identifierOrCriteria: '0',
  }));

  return {
    orderComponents: {
      conduitKey: constants.HashZero,
      consideration: [...considerationItems],
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
      endTime: Math.round(new Date(order.end_at).getTime() / 1000).toString(),
      startTime: Math.round(
        new Date(order.start_at).getTime() / 1000,
      ).toString(),
      salt: order.salt,
      offerer: order.account_address,
      zone: zoneAddress,
      // this should be the fee exclusive number of items the user signed for
      totalOriginalConsiderationItems: considerationItems.length,
      orderType: OrderType.FULL_RESTRICTED,
      zoneHash: constants.HashZero,
    },
    tips: fees,
  };
}
