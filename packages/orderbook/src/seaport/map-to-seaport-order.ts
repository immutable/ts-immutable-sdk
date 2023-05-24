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
    token: buyItem.contract_address!,
    identifierOrCriteria: '',
  }));

  const fees: ConsiderationItem[] = order.buy_fees.map((fee) => ({
    startAmount: fee.amount,
    endAmount: fee.amount,
    itemType: order.buy[0].item_type === 'ERC20' ? ItemType.ERC20 : ItemType.NATIVE,
    recipient: fee.recipient,
    token: order.buy[0].contract_address!,
    identifierOrCriteria: '',
  }));

  return {
    conduitKey: constants.AddressZero,
    consideration: [...considerationItems, ...fees],
    offer: order.sell.map((sellItem) => ({
      startAmount: '1',
      endAmount: '1',
      itemType: ItemType.ERC721,
      token: sellItem.contract_address!,
      identifierOrCriteria: sellItem.token_id,
    })),
    counter,
    endTime: order.end_time,
    startTime: order.start_time,
    salt: order.salt,
    offerer: order.account_address,
    zone: zoneAddress,
    totalOriginalConsiderationItems: 2,
    orderType: OrderType.FULL_RESTRICTED,
    zoneHash: constants.HashZero,
  };
}
