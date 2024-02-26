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
import { SignableTransferResponseDetails } from './signable-transfer-response-details';

/**
 * 
 * @export
 * @interface GetSignableTransferResponse
 */
export interface GetSignableTransferResponse {
    /**
     * Sender of the transfer
     * @type {string}
     * @memberof GetSignableTransferResponse
     */
    'sender_stark_key': string;
    /**
     * Message to sign with L1 wallet to confirm transfer request
     * @type {string}
     * @memberof GetSignableTransferResponse
     */
    'signable_message': string;
    /**
     * List of transfer responses without the sender stark key
     * @type {Array<SignableTransferResponseDetails>}
     * @memberof GetSignableTransferResponse
     */
    'signable_responses': Array<SignableTransferResponseDetails>;
}

