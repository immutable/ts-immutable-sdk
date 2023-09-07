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
import { Fee } from './fee';
// May contain unused imports in some cases
// @ts-ignore
import { Item } from './item';
// May contain unused imports in some cases
// @ts-ignore
import { ProtocolData } from './protocol-data';

/**
 * 
 * @export
 * @interface CreateListingRequestBody
 */
export interface CreateListingRequestBody {
    /**
     * 
     * @type {string}
     * @memberof CreateListingRequestBody
     */
    'account_address': string;
    /**
     * 
     * @type {string}
     * @memberof CreateListingRequestBody
     */
    'order_hash': string;
    /**
     * Buy item for listing should either be NATIVE or ERC20 item
     * @type {Array<Item>}
     * @memberof CreateListingRequestBody
     */
    'buy': Array<Item>;
    /**
     * 
     * @type {Fee}
     * @memberof CreateListingRequestBody
     */
    'fee'?: Fee;
    /**
     * Time after which the Order is considered expired
     * @type {string}
     * @memberof CreateListingRequestBody
     */
    'end_time': string;
    /**
     * 
     * @type {ProtocolData}
     * @memberof CreateListingRequestBody
     */
    'protocol_data': ProtocolData;
    /**
     * A random value added to the create Order request
     * @type {string}
     * @memberof CreateListingRequestBody
     */
    'salt': string;
    /**
     * Sell item for listing should be an ERC721 item
     * @type {Array<Item>}
     * @memberof CreateListingRequestBody
     */
    'sell': Array<Item>;
    /**
     * Digital signature generated by the user for the specific Order
     * @type {string}
     * @memberof CreateListingRequestBody
     */
    'signature': string;
    /**
     * Time after which Order is considered active
     * @type {string}
     * @memberof CreateListingRequestBody
     */
    'start_time': string;
}

