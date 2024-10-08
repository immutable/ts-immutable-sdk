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
import { ERC1155CollectionItem } from './erc1155-collection-item';
// May contain unused imports in some cases
// @ts-ignore
import { ERC1155Item } from './erc1155-item';
// May contain unused imports in some cases
// @ts-ignore
import { ERC20Item } from './erc20-item';
// May contain unused imports in some cases
// @ts-ignore
import { ERC721CollectionItem } from './erc721-collection-item';
// May contain unused imports in some cases
// @ts-ignore
import { ERC721Item } from './erc721-item';
// May contain unused imports in some cases
// @ts-ignore
import { NativeItem } from './native-item';

/**
 * @type Item
 * @export
 */
export type Item = { type: 'ERC1155' } & ERC1155Item | { type: 'ERC1155_COLLECTION' } & ERC1155CollectionItem | { type: 'ERC20' } & ERC20Item | { type: 'ERC721' } & ERC721Item | { type: 'ERC721_COLLECTION' } & ERC721CollectionItem | { type: 'NATIVE' } & NativeItem;


