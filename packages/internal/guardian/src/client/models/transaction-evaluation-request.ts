/* tslint:disable */
/* eslint-disable */
/**
 * Guardian
 * Guardian API
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
import type { ZkEvmTransactionData } from './zk-evm-transaction-data';
// May contain unused imports in some cases
// @ts-ignore
import type { ZkEvmTransactionEvaluationRequest } from './zk-evm-transaction-evaluation-request';

/**
 * @type TransactionEvaluationRequest
 * @export
 */
export type TransactionEvaluationRequest = { chainType: 'evm' } & ZkEvmTransactionEvaluationRequest | { chainType: 'starkex' };


