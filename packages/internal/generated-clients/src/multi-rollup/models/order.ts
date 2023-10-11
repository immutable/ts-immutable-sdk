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
import { Fee } from './fee';
// May contain unused imports in some cases
// @ts-ignore
import { Item } from './item';
// May contain unused imports in some cases
// @ts-ignore
import { OrderStatus } from './order-status';
// May contain unused imports in some cases
// @ts-ignore
import { ProtocolData } from './protocol-data';

/**
 * 
 * @export
 * @interface Order
 */
export interface Order {
    /**
     * 
     * @type {string}
     * @memberof Order
     */
    'account_address': string;
    /**
     * 
     * @type {Array<Item>}
     * @memberof Order
     */
    'buy': Array<Item>;
    /**
     * 
     * @type {Array<Fee>}
     * @memberof Order
     */
    'fees': Array<Fee>;
    /**
     * 
     * @type {Chain}
     * @memberof Order
     */
    'chain': Chain;
    /**
     * Time the Order is created
     * @type {string}
     * @memberof Order
     */
    'created_at': string;
    /**
     * Time after which the Order is considered expired
     * @type {string}
     * @memberof Order
     */
    'end_at': string;
    /**
     * Global Order identifier
     * @type {string}
     * @memberof Order
     */
    'id': string;
    /**
     * 
     * @type {ProtocolData}
     * @memberof Order
     */
    'protocol_data': ProtocolData;
    /**
     * A random value added to the create Order request
     * @type {string}
     * @memberof Order
     */
    'salt': string;
    /**
     * 
     * @type {Array<Item>}
     * @memberof Order
     */
    'sell': Array<Item>;
    /**
     * Digital signature generated by the user for the specific Order
     * @type {string}
     * @memberof Order
     */
    'signature': string;
    /**
     * Time after which Order is considered active
     * @type {string}
     * @memberof Order
     */
    'start_at': string;
    /**
     * 
     * @type {OrderStatus}
     * @memberof Order
     */
    'status': OrderStatus;
    /**
     * Time the Order is last updated
     * @type {string}
     * @memberof Order
     */
    'updated_at': string;
}



