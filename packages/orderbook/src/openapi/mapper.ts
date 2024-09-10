import {
  ERC1155Item,
  ERC20Item,
  ERC721Item,
  FeeType,
  Listing,
  NativeItem,
  Page,
  Trade,
} from '../types';
import { Order as OpenApiOrder } from './sdk/models/Order';
import { Page as OpenApiPage } from './sdk/models/Page';
import { Trade as OpenApiTrade } from './sdk/models/Trade';

export function mapListingFromOpenApiOrder(order: OpenApiOrder): Listing {
  if (order.type !== OpenApiOrder.type.LISTING) {
    throw new Error('Order type must be LISTING');
  }

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

    throw new Error('Listing sell items must either ERC721 or ERC1155');
  });

  const buyItems: (ERC20Item | NativeItem)[] = order.buy.map((item) => {
    if (item.type === 'NATIVE') {
      return {
        type: 'NATIVE',
        amount: item.amount,
      };
    }

    if (item.type === 'ERC20') {
      return {
        type: 'ERC20',
        contractAddress: item.contract_address,
        amount: item.amount,
      };
    }

    throw new Error('Listing buy items must be either NATIVE or ERC20');
  });

  return {
    id: order.id,
    type: order.type,
    chain: order.chain,
    accountAddress: order.account_address,
    sell: sellItems,
    buy: buyItems,
    fees: order.fees.map((fee) => ({
      amount: fee.amount,
      recipientAddress: fee.recipient_address,
      type: fee.type as unknown as FeeType,
    })),
    status: order.status,
    fillStatus: order.fill_status,
    startAt: order.start_at,
    endAt: order.end_at,
    salt: order.salt,
    signature: order.signature,
    orderHash: order.order_hash,
    protocolData: {
      orderType: order.protocol_data.order_type,
      counter: order.protocol_data.counter,
      seaportAddress: order.protocol_data.seaport_address,
      seaportVersion: order.protocol_data.seaport_version,
      zoneAddress: order.protocol_data.zone_address,
    },
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  };
}

export function mapFromOpenApiTrade(trade: OpenApiTrade): Trade {
  const buyItems: (ERC20Item | NativeItem | ERC721Item | ERC1155Item)[] = trade.buy.map((item) => {
    if (item.type === 'NATIVE') {
      return {
        type: 'NATIVE',
        amount: item.amount,
      };
    }

    if (item.type === 'ERC20') {
      return {
        type: 'ERC20',
        contractAddress: item.contract_address,
        amount: item.amount,
      };
    }

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

    throw new Error('Buy items must be NATIVE, ERC20, ERC721 or ERC1155');
  });

  const sellItems: (ERC20Item | ERC721Item | ERC1155Item)[] = trade.sell.map(
    (item) => {
      if (item.type === 'ERC20') {
        return {
          type: 'ERC20',
          contractAddress: item.contract_address,
          amount: item.amount,
        };
      }

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

      throw new Error('Sell items must be ERC20, ERC721 or ERC1155');
    },
  );

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
