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
 * @interface TransactionEvaluationResponse
 */
export interface TransactionEvaluationResponse {
    /**
     * 
     * @type {boolean}
     * @memberof TransactionEvaluationResponse
     */
    'confirmationRequired': boolean;
    /**
     * 
     * @type {string}
     * @memberof TransactionEvaluationResponse
     */
    'confirmationMethod'?: TransactionEvaluationResponseConfirmationMethodEnum;
    /**
     * 
     * @type {string}
     * @memberof TransactionEvaluationResponse
     */
    'transactionId'?: string;
}

export const TransactionEvaluationResponseConfirmationMethodEnum = {
    Otp: 'otp',
    Web: 'web'
} as const;

export type TransactionEvaluationResponseConfirmationMethodEnum = typeof TransactionEvaluationResponseConfirmationMethodEnum[keyof typeof TransactionEvaluationResponseConfirmationMethodEnum];


