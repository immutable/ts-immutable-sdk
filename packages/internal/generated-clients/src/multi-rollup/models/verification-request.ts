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
import { VerificationRequestContractType } from './verification-request-contract-type';
// May contain unused imports in some cases
// @ts-ignore
import { VerificationRequestStatus } from './verification-request-status';

/**
 * The verification request
 * @export
 * @interface VerificationRequest
 */
export interface VerificationRequest {
    /**
     * The id of the verification request
     * @type {string}
     * @memberof VerificationRequest
     */
    'id': string;
    /**
     * 
     * @type {Chain}
     * @memberof VerificationRequest
     */
    'chain': Chain;
    /**
     * The contract address
     * @type {string}
     * @memberof VerificationRequest
     */
    'contract_address': string;
    /**
     * The name of the organisation associated with this contract
     * @type {string}
     * @memberof VerificationRequest
     */
    'org_name': string | null;
    /**
     * The name of the collection
     * @type {string}
     * @memberof VerificationRequest
     */
    'name': string | null;
    /**
     * The symbol of contract
     * @type {string}
     * @memberof VerificationRequest
     */
    'symbol': string | null;
    /**
     * The description of collection
     * @type {string}
     * @memberof VerificationRequest
     */
    'description': string | null;
    /**
     * The id of the organisation associated with this contract
     * @type {string}
     * @memberof VerificationRequest
     */
    'org_id': string | null;
    /**
     * The email address of the user who requested the contract to be verified
     * @type {string}
     * @memberof VerificationRequest
     */
    'requester_email': string | null;
    /**
     * 
     * @type {VerificationRequestContractType}
     * @memberof VerificationRequest
     */
    'contract_type': VerificationRequestContractType;
    /**
     * 
     * @type {VerificationRequestStatus}
     * @memberof VerificationRequest
     */
    'verification_request_status': VerificationRequestStatus;
}



