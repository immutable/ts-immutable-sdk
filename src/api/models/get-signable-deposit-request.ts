/* tslint:disable */
/* eslint-disable */
/**
 * Immutable X API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 3.0
 * Contact: support@immutable.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import { SignableToken } from './signable-token';

/**
 * 
 * @export
 * @interface GetSignableDepositRequest
 */
export interface GetSignableDepositRequest {
    /**
     * Amount of the token the user is depositing
     * @type {string}
     * @memberof GetSignableDepositRequest
     */
    'amount': string;
    /**
     * 
     * @type {SignableToken}
     * @memberof GetSignableDepositRequest
     */
    'token': SignableToken;
    /**
     * User who is depositing
     * @type {string}
     * @memberof GetSignableDepositRequest
     */
    'user': string;
}

