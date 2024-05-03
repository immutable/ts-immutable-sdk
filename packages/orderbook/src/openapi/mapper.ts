import { Order as OpenApiOrder } from './sdk/models/Order';
import { Trade as OpenApiTrade } from './sdk/models/Trade';
import { Page as OpenApiPage } from './sdk/models/Page';
import {
  ERC20Item,
  NativeItem,
  Order,
  ERC721Item,
  FeeType,
  Page,
  Trade,
  ERC1155Item,
} from '../types';

export function mapFromOpenApiOrder(order: OpenApiOrder): Order {
  const buyItems: (ERC20Item | NativeItem)[] = order.buy.map((item) => {
    if (item.type === 'ERC20') {
      return {
        type: 'ERC20',
        contractAddress: item.contract_address,
        amount: item.amount,
      };
    }

    if (item.type === 'NATIVE') {
      return {
        type: 'NATIVE',
        amount: item.amount,
      };
    }

    throw new Error('Buy items must be either ERC20 or NATIVE');
  });

  const sellItems: (ERC721Item | ERC1155Item)[] = order.sell.map((item) => {
    if (item.type === 'ERC721') {
      return {
        type: 'ERC721',
        contractAddress: item.contract_address,
        tokenId: item.token_id,
      };
    }

    if (item.type === 'ERC1155') {
      return {
        type: 'ERC1155',
        contractAddress: item.contract_address,
        tokenId: item.token_id,
        amount: item.amount,
      };
    }

    throw new Error('Sell items must ERC721 or ERC1155');
  });

  return {
    id: order.id,
    type: order.type,
    accountAddress: order.account_address,
    buy: buyItems,
    sell: sellItems,
    fees: order.fees.map((fee) => ({
      amount: fee.amount,
      recipientAddress: fee.recipient_address,
      type: fee.type as unknown as FeeType,
    })),
    fillStatus: order.fill_status,
    chain: order.chain,
    createdAt: order.created_at,
    endAt: order.end_at,
    orderHash: order.order_hash,
    protocolData: {
      orderType: order.protocol_data.order_type,
      counter: order.protocol_data.counter,
      seaportAddress: order.protocol_data.seaport_address,
      seaportVersion: order.protocol_data.seaport_version,
      zoneAddress: order.protocol_data.zone_address,
    },
    salt: order.salt,
    signature: order.signature,
    startAt: order.start_at,
    status: order.status,
    updatedAt: order.updated_at,
  };
}

export function mapFromOpenApiTrade(trade: OpenApiTrade): Trade {
  const buyItems: (ERC20Item | NativeItem)[] = trade.buy.map((item) => {
    if (item.type === 'ERC20') {
      return {
        type: 'ERC20',
        contractAddress: item.contract_address,
        amount: item.amount,
      };
    }

    if (item.type === 'NATIVE') {
      return {
        type: 'NATIVE',
        amount: item.amount,
      };
    }

    throw new Error('Buy items must be either ERC20 or NATIVE');
  });

  const sellItems: ERC721Item[] = trade.sell.map((item) => {
    if (item.type === 'ERC721') {
      return {
        type: 'ERC721',
        contractAddress: item.contract_address,
        tokenId: item.token_id,
      };
    }

    throw new Error('Sell items must ERC721');
  });

  return {
    id: trade.id,
    orderId: trade.order_id,
    buy: buyItems,
    sell: sellItems,
    buyerFees: trade.buyer_fees.map((fee) => ({
      amount: fee.amount,
      recipientAddress: fee.recipient_address,
      type: fee.type as unknown as FeeType,
    })),
    chain: trade.chain,
    indexedAt: trade.indexed_at,
    blockchainMetadata: {
      blockNumber: trade.blockchain_metadata.block_number,
      logIndex: trade.blockchain_metadata.log_index,
      transactionHash: trade.blockchain_metadata.transaction_hash,
      transactionIndex: trade.blockchain_metadata.transaction_index,
    },
    buyerAddress: trade.buyer_address,
    makerAddress: trade.maker_address,
    sellerAddress: trade.seller_address,
    takerAddress: trade.taker_address,
  };
}

export function mapFromOpenApiPage(page: OpenApiPage): Page {
  return {
    nextCursor: page.next_cursor,
    previousCursor: page.previous_cursor,
  };
}
