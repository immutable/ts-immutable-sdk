/* eslint-disable @typescript-eslint/naming-convention */

export interface BlockChainMetadata {
  log_index: string;
  block_number: string;
  transaction_hash: string;
  transaction_index: string;
}

export interface Chain {
  id: string;
  name: string;
}

export interface ZkevmActivityMint {
  event_name: 'imtbl_zkevm_activity_mint';
  event_id: string;
  chain: string;
  data: {
    id: string;
    chain: Chain;
    details: {
      to: string;
      asset: {
        token_id: string;
        contract_type: string;
        contract_address: string;
      };
      amount: string;
    };
    indexed_at: string;
    activity_type: string;
    blockchain_metadata: BlockChainMetadata;
  };
}

export interface ZkevmActivityBurn {
  event_name: 'imtbl_zkevm_activity_burn';
  event_id: string;
  chain: string;
  data: {
    id: string;
    chain: Chain;
    details: {
      from: string;
      asset: {
        token_id: string;
        contract_type: string;
        contract_address: string;
      };
      amount: string;
    };
    indexed_at: string;
    activity_type: string;
    blockchain_metadata: BlockChainMetadata;
  };
}

export interface ZkevmActivityTransfer {
  event_name: 'imtbl_zkevm_activity_transfer';
  event_id: string;
  chain: string;
  data: {
    id: string;
    chain: Chain;
    details: {
      to: string;
      from: string;
      asset: {
        token_id: string;
        contract_type: string;
        contract_address: string;
      };
      amount: string;
    };
    indexed_at: string;
    activity_type: string;
    blockchain_metadata: BlockChainMetadata;
  };
}

export interface ZkevmActivitySale {
  event_name: 'imtbl_zkevm_activity_sale';
  event_id: string;
  chain: string;
  data: {
    id: string;
    chain: Chain;
    details: {
      to: string;
      from: string;
      asset: {
        amount: string;
        token_id: string;
        contract_type: string;
        contract_address: string;
      }[];
      payment: {
        fees: {
          amount: string;
          fee_type: string;
          recipient: string;
        }[];
        token: {
          symbol: string;
          contract_type: string;
          contract_address: string;
        };
        price_excluding_fees: string;
        price_including_fees: string;
      };
      order_id: string;
    };
    indexed_at: string;
    activity_type: string;
    blockchain_metadata: BlockChainMetadata;
  };
}

export interface ZkevmActivityDeposit {
  event_name: 'imtbl_zkevm_activity_deposit';
  event_id: string;
  chain: string;
  data: {
    id: string;
    chain: Chain;
    details: {
      amount: string;
      asset: {
        contract_type: string;
        contract_address: string;
      };
      to: string;
    };
    indexed_at: string;
    activity_type: string;
    blockchain_metadata: BlockChainMetadata;
  };
}

export interface ZkevmActivityWithdrawal {
  event_name: 'imtbl_zkevm_activity_withdrawal';
  event_id: string;
  chain: string;
  data: {
    id: string;
    chain: Chain;
    details: {
      amount: string;
      asset: {
        contract_type: string;
        contract_address: string;
      };
      from: string;
    };
    indexed_at: string;
    activity_type: string;
    blockchain_metadata: BlockChainMetadata;
  };
}

export interface ZkevmCollectionUpdated {
  event_name: 'imtbl_zkevm_collection_updated';
  event_id: string;
  chain: string;
  data: {
    chain: Chain;
    contract_address: string;
    indexed_at: string;
    updated_at: string;
    contract_type: string;
    symbol: string | null;
    name: string | null;
    image: string | null;
    contract_uri: string | null;
    description: string | null;
    external_link: string | null;
    metadata_synced_at: string | null;
    decimals: string | null;
    root_contract_address: string | null;
  };
}

export interface ZkevmNftUpdated {
  event_name: 'imtbl_zkevm_nft_updated';
  event_id: string;
  chain: string;
  data: {
    chain: Chain;
    contract_address: string;
    indexed_at: string;
    metadata_synced_at: string | null;
    token_id: string;
    metadata_id: string | null;
  };
}

export interface ZkevmMintRequestUpdated {
  event_name: 'imtbl_zkevm_mint_request_updated';
  event_id: string;
  chain: string;
  data: {
    chain: Chain;
    contract_address: string;
    owner_address: string;
    reference_id: string;
    metadata_id: string;
    token_id: string | null;
    status: string;
    transaction_hash: string | null;
    activity_id: string | null;
    error: string | null;
    created_at: string;
    updated_at: string;
  };
}

export interface ZkevmMetadataUpdated {
  event_name: 'imtbl_zkevm_metadata_updated';
  event_id: string;
  chain: string;
  data: {
    id: string;
    chain: Chain;
    contract_address: string;
    image: string | null;
    external_url: string | null;
    description: string | null;
    name: string | null;
    attributes: {
      trait_type: string;
      value: string;
    }[];
    animation_url: string | null;
    youtube_url: string | null;
    created_at: string;
    updated_at: string;
  };
}

export interface ZkevmTokenUpdated {
  event_name: 'imtbl_zkevm_token_updated';
  event_id: string;
  chain: string;
  data: {
    chain: Chain;
    contract_address: string;
    indexed_at: string;
    updated_at: string;
    contract_type: string;
    symbol: string;
    name: string;
    image: string | null;
    contract_uri: string | null;
    description: string | null;
    external_link: string | null;
    metadata_synced_at: string | null;
    decimals: number;
    root_contract_address: string | null;
  };
}

export interface ZkevmOrderUpdated {
  event_name: 'imtbl_zkevm_order_updated';
  event_id: string;
  chain: string;
  data: {
    id: string;
    buy: {
      item_type: string;
      end_amount: string;
      start_amount: string;
      contract_address: string;
    }[];
    hash: string;
    salt: string;
    sell: {
      token_id: string;
      item_type: string;
      end_amount: string;
      start_amount: string;
      contract_address: string;
    }[];
    status: string;
    fill_status: {
      denominator: string;
      numerator: string;
    };
    chain_id: string;
    end_time: number;
    signature: string;
    buyer_fees: {
      amount: string;
      fee_type: string;
      recipient: string;
    }[];
    created_at: number;
    start_time: number;
    updated_at: number;
    protocol_data: {
      counter: string;
      order_type: string;
      zone_address: string;
      seaport_address: string;
      seaport_version: string;
    };
    account_address: string;
  };
}

export interface ZkevmTradeCreated {
  event_name: 'imtbl_zkevm_trade_created';
  event_id: string;
  chain: string;
  data: {
    id: string;
    tx_hash: string;
    chain_id: string;
    order_id: string;
    buy_items: {
      amount: string;
      item_type: string;
      contract_address: string;
    }[];
    buyer_fees: {
      amount: string;
      fee_type: string;
      recipient: string;
    }[];
    sell_items: {
      amount: string;
      token_id: string;
      item_type: string;
      contract_address: string;
    }[];
    block_number: string;
    buyer_address: string;
    seller_address: string;
    tx_index_in_block: string;
    log_index_in_block: string;
  };
}
