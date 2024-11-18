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
import { LastTrade } from './last-trade';
// May contain unused imports in some cases
// @ts-ignore
import { MarketFloorListing } from './market-floor-listing';

/**
 * Market data
 * @export
 * @interface Market
 */
export interface Market {
    /**
     * 
     * @type {MarketFloorListing}
     * @memberof Market
     */
    'floor_listing': MarketFloorListing | null;
    /**
     * 
     * @type {LastTrade}
     * @memberof Market
     */
    'last_trade': LastTrade | null;
}
