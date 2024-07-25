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
import { ImmutableVerificationStatusEnum } from './immutable-verification-status-enum';

/**
 * 
 * @export
 * @interface ERC721TransferFromMetadata
 */
export interface ERC721TransferFromMetadata {
    /**
     * Transaction type
     * @type {string}
     * @memberof ERC721TransferFromMetadata
     */
    'transaction_type': ERC721TransferFromMetadataTransactionTypeEnum;
    /**
     * The address to transfer the token from
     * @type {string}
     * @memberof ERC721TransferFromMetadata
     */
    'from_address': string;
    /**
     * The address to transfer the token to
     * @type {string}
     * @memberof ERC721TransferFromMetadata
     */
    'to_address': string;
    /**
     * The collection name the ERC721 belongs to
     * @type {string}
     * @memberof ERC721TransferFromMetadata
     */
    'collection_name': string;
    /**
     * ID of the ERC721
     * @type {string}
     * @memberof ERC721TransferFromMetadata
     */
    'token_id': string;
    /**
     * The name of the ERC721
     * @type {string}
     * @memberof ERC721TransferFromMetadata
     */
    'asset_name': string;
    /**
     * The image of the ERC721
     * @type {string}
     * @memberof ERC721TransferFromMetadata
     */
    'asset_image': string;
    /**
     * 
     * @type {ImmutableVerificationStatusEnum}
     * @memberof ERC721TransferFromMetadata
     */
    'immutable_verification_status': ImmutableVerificationStatusEnum;
}

export const ERC721TransferFromMetadataTransactionTypeEnum = {
    Erc721TransferFrom: 'ERC721_TRANSFER_FROM'
} as const;

export type ERC721TransferFromMetadataTransactionTypeEnum = typeof ERC721TransferFromMetadataTransactionTypeEnum[keyof typeof ERC721TransferFromMetadataTransactionTypeEnum];


