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
 * The status of a contract on the operator allowlist
 * @export
 * @enum {string}
 */

export const OperatorAllowlistStatus = {
    Requested: 'requested',
    Approved: 'approved',
    Rejected: 'rejected',
    Removed: 'removed',
    Added: 'added'
} as const;

export type OperatorAllowlistStatus = typeof OperatorAllowlistStatus[keyof typeof OperatorAllowlistStatus];



