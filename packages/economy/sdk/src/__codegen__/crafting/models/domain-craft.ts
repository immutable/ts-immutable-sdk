/* tslint:disable */
/* eslint-disable */
/**
 * Crafting API
 * Crafting API
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


// May contain unused imports in some cases
// @ts-ignore
import { DomainCraftOutput } from './domain-craft-output';
// May contain unused imports in some cases
// @ts-ignore
import { DomainCraftStatus } from './domain-craft-status';

/**
 * 
 * @export
 * @interface DomainCraft
 */
export interface DomainCraft {
    /**
     * 
     * @type {string}
     * @memberof DomainCraft
     */
    'game_id'?: string;
    /**
     * 
     * @type {string}
     * @memberof DomainCraft
     */
    'id'?: string;
    /**
     * 
     * @type {Array<string>}
     * @memberof DomainCraft
     */
    'input_item_ids'?: Array<string>;
    /**
     * 
     * @type {Array<string>}
     * @memberof DomainCraft
     */
    'output_item_ids'?: Array<string>;
    /**
     * 
     * @type {Array<DomainCraftOutput>}
     * @memberof DomainCraft
     */
    'outputs'?: Array<DomainCraftOutput>;
    /**
     * 
     * @type {string}
     * @memberof DomainCraft
     */
    'recipe_id'?: string;
    /**
     * 
     * @type {DomainCraftStatus}
     * @memberof DomainCraft
     */
    'status'?: DomainCraftStatus;
    /**
     * 
     * @type {string}
     * @memberof DomainCraft
     */
    'user_id'?: string;
}

