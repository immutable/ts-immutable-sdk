/* tslint:disable */
/* eslint-disable */
/**
 * Immutable X API
 * Immutable X API
 *
 * The version of the OpenAPI document: 3.0.0
 * Contact: support@immutable.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


// May contain unused imports in some cases
// @ts-ignore
import { ExperimentalGetPrimarySaleOKBodyResultFeesItems } from './experimental-get-primary-sale-okbody-result-fees-items';

/**
 * 
 * @export
 * @interface ExperimentalGetPrimarySaleOKBodyResult
 */
export interface ExperimentalGetPrimarySaleOKBodyResult {
    /**
     * Ethereum address of the buyer
     * @type {string}
     * @memberof ExperimentalGetPrimarySaleOKBodyResult
     */
    'buyer_ether_key': string;
    /**
     * Time the primary sale was created
     * @type {string}
     * @memberof ExperimentalGetPrimarySaleOKBodyResult
     */
    'created_at': string;
    /**
     * Time the primary sale expires
     * @type {string}
     * @memberof ExperimentalGetPrimarySaleOKBodyResult
     */
    'expires_at': string;
    /**
     * 
     * @type {Array<ExperimentalGetPrimarySaleOKBodyResultFeesItems>}
     * @memberof ExperimentalGetPrimarySaleOKBodyResult
     */
    'fees'?: Array<ExperimentalGetPrimarySaleOKBodyResultFeesItems>;
    /**
     * Global Primary Sale identifier
     * @type {number}
     * @memberof ExperimentalGetPrimarySaleOKBodyResult
     */
    'id': number;
    /**
     * Ethereum address of the items receiver
     * @type {string}
     * @memberof ExperimentalGetPrimarySaleOKBodyResult
     */
    'items_recipient_ether_key': string;
    /**
     * Fee inclusive amount of the transfer
     * @type {string}
     * @memberof ExperimentalGetPrimarySaleOKBodyResult
     */
    'payment_amount': string;
    /**
     * Ethereum address of the payment receiver
     * @type {string}
     * @memberof ExperimentalGetPrimarySaleOKBodyResult
     */
    'payment_recipient_ether_key': string;
    /**
     * 
     * @type {object}
     * @memberof ExperimentalGetPrimarySaleOKBodyResult
     */
    'payment_token': object;
    /**
     * The primary sale status
     * @type {string}
     * @memberof ExperimentalGetPrimarySaleOKBodyResult
     */
    'status': ExperimentalGetPrimarySaleOKBodyResultStatusEnum;
    /**
     * Arbitrary data defined by the selling party (e.g. game studio) to identify the primary sale. We suggest signing this payload to verify authenticity when processing.
     * @type {string}
     * @memberof ExperimentalGetPrimarySaleOKBodyResult
     */
    'studio_data': string;
    /**
     * Ethereum address of the studio operating the primary sale, will be used to verify in completion
     * @type {string}
     * @memberof ExperimentalGetPrimarySaleOKBodyResult
     */
    'studio_ether_key': string;
    /**
     * Time the primary sale was updated
     * @type {string}
     * @memberof ExperimentalGetPrimarySaleOKBodyResult
     */
    'updated_at': string;
}

export const ExperimentalGetPrimarySaleOKBodyResultStatusEnum = {
    Pending: 'PENDING',
    Active: 'ACTIVE',
    Invalid: 'INVALID',
    InProgress: 'IN_PROGRESS',
    Accepted: 'ACCEPTED',
    Rejected: 'REJECTED',
    Expired: 'EXPIRED'
} as const;

export type ExperimentalGetPrimarySaleOKBodyResultStatusEnum = typeof ExperimentalGetPrimarySaleOKBodyResultStatusEnum[keyof typeof ExperimentalGetPrimarySaleOKBodyResultStatusEnum];


