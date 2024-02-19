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
import { MintRequestErrorMessage } from './mint-request-error-message';
// May contain unused imports in some cases
// @ts-ignore
import { MintRequestStatus } from './mint-request-status';

/**
 * 
 * @export
 * @interface GetMintRequestResult
 */
export interface GetMintRequestResult {
    /**
     * 
     * @type {Chain}
     * @memberof GetMintRequestResult
     */
    'chain': Chain;
    /**
     * The address of the contract
     * @type {string}
     * @memberof GetMintRequestResult
     */
    'collection_address': string;
    /**
     * The reference ID of this mint request
     * @type {string}
     * @memberof GetMintRequestResult
     */
    'reference_id': string;
    /**
     * The address of the owner of the NFT
     * @type {string}
     * @memberof GetMintRequestResult
     */
    'owner_address': string;
    /**
     * An `uint256` token id as string. Only available when the mint request succeeds
     * @type {string}
     * @memberof GetMintRequestResult
     */
    'token_id': string | null;
    /**
     * The id of the mint activity associated with this mint request
     * @type {string}
     * @memberof GetMintRequestResult
     */
    'activity_id'?: string | null;
    /**
     * The transaction hash of the activity
     * @type {string}
     * @memberof GetMintRequestResult
     */
    'transaction_hash': string | null;
    /**
     * When the mint request was created
     * @type {string}
     * @memberof GetMintRequestResult
     */
    'created_at': string;
    /**
     * When the mint request was last updated
     * @type {string}
     * @memberof GetMintRequestResult
     */
    'updated_at': string;
    /**
     * 
     * @type {MintRequestErrorMessage}
     * @memberof GetMintRequestResult
     */
    'error': MintRequestErrorMessage | null;
    /**
     * 
     * @type {MintRequestStatus}
     * @memberof GetMintRequestResult
     */
    'status': MintRequestStatus;
}



