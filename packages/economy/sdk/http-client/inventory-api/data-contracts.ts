/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface InventoryBatchRequest {
  items?: InventoryBatchRequestItems;
}

export interface InventoryBatchRequestItems {
  create?: InventoryCreateItemRequest[];
  delete?: InventoryDeleteItemRequest[];
}

export interface InventoryCreateItemRequest {
  /**
   * @format uuid
   * @example "00000000-0000-0000-0000-000000000000"
   */
  item_definition_id: string;
  /**
   * Location of the item. Can be one of the following values:
   * * offchain - Off chain, only in the inventory system.
   * * starkex - On the StarkEx Network.
   * * zkevm - On the ZK EVM Network.
   */
  location: 'offchain' | 'zkevm' | 'starkex';
  /** JSON Object of item properties e.g. {"Level": 2, "Rarity": "Common"} */
  metadata?: object;
  /**
   * @format user_id,eth_address
   * @example "00000000-0000-0000-0000-000000000000,0x000000000000"
   */
  owner: string;
}

export interface InventoryDeleteItemRequest {
  /** @example "shardbound::item::00000000-0000-0000-0000-000000000000::2OJwAJu2EpNckUgT0cY09cfZfCk" */
  item_id: string;
}

export interface InventoryItem {
  /**
   * @format eth_address
   * @example "0x0000000000000000000000000000000000000000"
   */
  contract_id?: string;
  /**
   * @format date-time
   * @example "2023-04-05T00:00:00+00:00"
   */
  created_at?: string;
  /**
   * @format date-time
   * @example "2023-04-05T00:00:00+00:00"
   */
  deleted_at?: string;
  /** @example "shardbound" */
  game_id?: string;
  /**
   * @format resource_id
   * @example "shardbound::item::item_definition_1::0ujsszwN8NRY24YaXiTIE2VWDTS"
   */
  id?: string;
  /**
   * @format uuid
   * @example "00000000-0000-0000-0000-000000000000"
   */
  item_definition_id?: string;
  /**
   * @format date-time
   * @example "2023-04-05T00:00:00+00:00"
   */
  last_traded?: string;
  /**
   * Location of the item. Can be one of the following values:
   * * offchain - Off chain, only in the inventory system.
   * * starkex - On the StarkEx Network.
   * * zkevm - On the ZK EVM Network.
   * @example "offchain"
   */
  location?: string;
  /** JSON Object of item properties e.g. {"Level": 2, "Rarity": "Common"} */
  metadata?: object;
  /**
   * @format user_id,eth_address
   * @example "00000000-0000-0000-0000-000000000000,0x0000000000000000000000000000000000000000"
   */
  owner?: string;
  /**
   * Status of the item. Can be one of the following values:
   * * minted - The item has been minted and is in the inventory system.
   * * minting - The item has been requested to be minted
   * * pending - The item is pending to be minted.
   * * failed - The item failed to be minted.
   * * offchain - The item is off chain. No minting is required.
   * @example "U3dhZ2dlciByb2Nrcw=="
   */
  status?: string;
  /**
   * @format eth_address
   * @example "0x0000000000000000000000000000000000000000"
   */
  token_id?: string;
  /**
   * @format date-time
   * @example "2023-04-05T00:00:00+00:00"
   */
  updated_at?: string;
}

export interface InventoryMintItemRequest {
  item_id?: string[];
}

export interface InventoryPaginatedItems {
  direction?: string;
  limit?: number;
  page?: number;
  rows?: InventoryItem[];
  sort?: string;
  total_pages?: number;
  total_rows?: number;
}

export interface InventoryUpdateItemRequest {
  /** JSON Object of item properties e.g. {"Level": 2, "Rarity": "Common"} */
  metadata?: object;
  /**
   * Overwrite means the metadata will overwrite the existing metadata entirely.
   * @example false
   */
  overwrite?: boolean;
}
