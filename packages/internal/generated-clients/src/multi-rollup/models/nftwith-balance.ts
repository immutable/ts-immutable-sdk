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
import { Chain } from './chain';
// May contain unused imports in some cases
// @ts-ignore
import { NFTContractType } from './nftcontract-type';
// May contain unused imports in some cases
// @ts-ignore
import { NFTMetadataAttribute } from './nftmetadata-attribute';

/**
 * 
 * @export
 * @interface NFTWithBalance
 */
export interface NFTWithBalance {
    /**
     * 
     * @type {Chain}
     * @memberof NFTWithBalance
     */
    'chain': Chain;
    /**
     * An `uint256` token id as string
     * @type {string}
     * @memberof NFTWithBalance
     */
    'token_id': string;
    /**
     * The contract address of the NFT
     * @type {string}
     * @memberof NFTWithBalance
     */
    'contract_address': string;
    /**
     * 
     * @type {NFTContractType}
     * @memberof NFTWithBalance
     */
    'contract_type': NFTContractType;
    /**
     * When the NFT was first indexed
     * @type {string}
     * @memberof NFTWithBalance
     */
    'indexed_at': string;
    /**
     * When the NFT owner was last updated
     * @type {string}
     * @memberof NFTWithBalance
     */
    'updated_at': string;
    /**
     * When NFT metadata was last synced
     * @type {string}
     * @memberof NFTWithBalance
     */
    'metadata_synced_at': string | null;
    /**
     * The id of the metadata of this NFT
     * @type {string}
     * @memberof NFTWithBalance
     */
    'metadata_id'?: string | null;
    /**
     * The name of the NFT
     * @type {string}
     * @memberof NFTWithBalance
     */
    'name': string | null;
    /**
     * The description of the NFT
     * @type {string}
     * @memberof NFTWithBalance
     */
    'description': string | null;
    /**
     * The image url of the NFT
     * @type {string}
     * @memberof NFTWithBalance
     */
    'image': string | null;
    /**
     * The external website link of NFT
     * @type {string}
     * @memberof NFTWithBalance
     */
    'external_link': string | null;
    /**
     * The animation url of the NFT
     * @type {string}
     * @memberof NFTWithBalance
     */
    'animation_url': string | null;
    /**
     * The youtube URL of NFT
     * @type {string}
     * @memberof NFTWithBalance
     */
    'youtube_url': string | null;
    /**
     * List of Metadata attributes
     * @type {Array<NFTMetadataAttribute>}
     * @memberof NFTWithBalance
     */
    'attributes': Array<NFTMetadataAttribute>;
    /**
     * The amount of this NFT this account owns
     * @type {string}
     * @memberof NFTWithBalance
     */
    'balance': string;
}



