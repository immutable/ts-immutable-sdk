/* tslint:disable */
/* eslint-disable */
/**
 * Swagger Guardian
 * Guardian API
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
 * @interface StarkExTransactionValidateReponseDefinition
 */
export interface StarkExTransactionValidateReponseDefinition {
    /**
     * 
     * @type {boolean}
     * @memberof StarkExTransactionValidateReponseDefinition
     */
    'confirmationRequired': boolean;
    /**
     * 
     * @type {string}
     * @memberof StarkExTransactionValidateReponseDefinition
     */
    'confirmationMethod'?: StarkExTransactionValidateReponseDefinitionConfirmationMethodEnum;
}

export const StarkExTransactionValidateReponseDefinitionConfirmationMethodEnum = {
    Otp: 'otp',
    Web: 'web'
} as const;

export type StarkExTransactionValidateReponseDefinitionConfirmationMethodEnum = typeof StarkExTransactionValidateReponseDefinitionConfirmationMethodEnum[keyof typeof StarkExTransactionValidateReponseDefinitionConfirmationMethodEnum];


