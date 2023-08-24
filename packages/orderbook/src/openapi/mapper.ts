import { Order as OpenApiOrder } from './sdk/models/Order';
import { Page as OpenApiPage } from './sdk/models/Page';
import {
  ERC20Item,
  NativeItem,
  Order,
  ERC721Item,
  FeeType,
  Page,
} from '../types';

export function mapFromOpenApiOrder(order: OpenApiOrder): Order {
  const buyItems: (ERC20Item | NativeItem)[] = order.buy.map((item) => {
    if (item.item_type === 'ERC20') {
      return {
        type: 'ERC20',
        contractAddress: item.contract_address,
        amount: item.start_amount,
      };
    }

    if (item.item_type === 'NATIVE') {
      return {
        type: 'NATIVE',
        amount: item.start_amount,
      };
    }

    throw new Error('Buy items must be either ERC20 or NATIVE');
  });

  const sellItems: ERC721Item[] = order.sell.map((item) => {
    if (item.item_type === 'ERC721') {
      return {
        type: 'ERC721',
        contractAddress: item.contract_address,
        tokenId: item.token_id,
      };
    }

    throw new Error('Sell items must ERC721');
  });

  return {
    id: order.id,
    accountAddress: order.account_address,
    buy: buyItems,
    sell: sellItems,
    fees: order.fees.map((fee) => ({
      amount: fee.amount,
      recipient: fee.recipient,
      type: fee.fee_type as unknown as FeeType,
    })),
    chain: order.chain,
    createTime: order.create_time,
    endTime: order.end_time,
    protocolData: {
      counter: order.protocol_data.counter,
      orderType: order.protocol_data.order_type,
      seaportAddress: order.protocol_data.seaport_address,
      seaportVersion: order.protocol_data.seaport_version,
      zoneAddress: order.protocol_data.zone_address,
    },
    salt: order.salt,
    signature: order.signature,
    startTime: order.start_time,
    status: order.status,
    updateTime: order.update_time,
  };
}

export function mapFromOpenApiPage(page: OpenApiPage): Page {
  return {
    nextCursor: page.next_cursor,
    previousCursor: page.previous_cursor,
  };
}
