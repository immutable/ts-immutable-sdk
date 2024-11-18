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



/**
 * 
 * @export
 * @interface MarketPriceNativeToken
 */
export interface MarketPriceNativeToken {
    /**
     * Token type user is offering, which in this case is the native IMX token
     * @type {string}
     * @memberof MarketPriceNativeToken
     */
    'type': MarketPriceNativeTokenTypeEnum;
    /**
     * The symbol of token
     * @type {string}
     * @memberof MarketPriceNativeToken
     */
    'symbol': string | null;
}

export const MarketPriceNativeTokenTypeEnum = {
    Native: 'NATIVE'
} as const;

export type MarketPriceNativeTokenTypeEnum = typeof MarketPriceNativeTokenTypeEnum[keyof typeof MarketPriceNativeTokenTypeEnum];

