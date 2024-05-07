/* tslint:disable */
/* eslint-disable */
/**
 * Immutable zkEVM API
 * Immutable Multi Rollup API
 *
 * The version of the OpenAPI document: 1.0.0
 * Contact: support@immutable.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


// May contain unused imports in some cases
// @ts-ignore
import { ERC721SafeTransferFromBatchItem } from './erc721-safe-transfer-from-batch-item';

/**
 * 
 * @export
 * @interface ERC721SafeTransferFromBatchMetadata
 */
export interface ERC721SafeTransferFromBatchMetadata {
    /**
     * Transaction type
     * @type {string}
     * @memberof ERC721SafeTransferFromBatchMetadata
     */
    'transaction_type': ERC721SafeTransferFromBatchMetadataTransactionTypeEnum;
    /**
     * The address to transfer the token from
     * @type {string}
     * @memberof ERC721SafeTransferFromBatchMetadata
     */
    'from_address': string;
    /**
     * The collection name the ERC721 belongs to
     * @type {string}
     * @memberof ERC721SafeTransferFromBatchMetadata
     */
    'collection_name': string;
    /**
     * The ERC721s to transfer and where to transfer them to
     * @type {Array<ERC721SafeTransferFromBatchItem>}
     * @memberof ERC721SafeTransferFromBatchMetadata
     */
    'items': Array<ERC721SafeTransferFromBatchItem>;
}

export const ERC721SafeTransferFromBatchMetadataTransactionTypeEnum = {
    Erc721SafeTransferFromBatch: 'ERC721_SAFE_TRANSFER_FROM_BATCH'
} as const;

export type ERC721SafeTransferFromBatchMetadataTransactionTypeEnum = typeof ERC721SafeTransferFromBatchMetadataTransactionTypeEnum[keyof typeof ERC721SafeTransferFromBatchMetadataTransactionTypeEnum];


