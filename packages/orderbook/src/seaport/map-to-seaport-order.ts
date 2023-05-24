import { ItemType, OrderType } from '@opensea/seaport-js/lib/constants';
import { ConsiderationItem, OrderComponents } from '@opensea/seaport-js/lib/types';
import { Order } from 'openapi/sdk';
import { constants } from 'ethers';

export function mapImmutableOrderToSeaportOrderComponents(
  order: Order,
  counter: string,
  zoneAddress: string,
): OrderComponents {
  const considerationItems: ConsiderationItem[] = order.buy.map((buyItem) => ({
    startAmount: buyItem.start_amount,
    endAmount: buyItem.start_amount,
    itemType: buyItem.item_type === 'ERC20' ? ItemType.ERC20 : ItemType.NATIVE,
    recipient: order.account_address,
    token: buyItem.contract_address! || constants.AddressZero,
    identifierOrCriteria: '0',
  }));

  const fees: ConsiderationItem[] = order.buy_fees.map((fee) => ({
    startAmount: fee.amount,
    endAmount: fee.amount,
    itemType: order.buy[0].item_type === 'ERC20' ? ItemType.ERC20 : ItemType.NATIVE,
    recipient: fee.recipient,
    token: order.buy[0].contract_address! || constants.AddressZero,
    identifierOrCriteria: '0',
  }));

  return {
    conduitKey: constants.HashZero,
    consideration: [...considerationItems, ...fees],
    offer: order.sell.map((sellItem) => ({
      startAmount: '1',
      endAmount: '1',
      itemType: ItemType.ERC721,
      token: sellItem.contract_address!,
      identifierOrCriteria: sellItem.token_id,
    })),
    counter,
    endTime: Math.round(new Date(order.end_time).getTime() / 1000).toString(),
    startTime: Math.round(new Date(order.start_time).getTime() / 1000).toString(),
    salt: order.salt,
    offerer: order.account_address,
    zone: zoneAddress,
    totalOriginalConsiderationItems: 2,
    orderType: OrderType.FULL_RESTRICTED,
    zoneHash: constants.HashZero,
  };
}
