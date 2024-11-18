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


import type { Configuration } from '../configuration';
import type { AxiosPromise, AxiosInstance, AxiosRequestConfig } from 'axios';
import globalAxios from 'axios';
// Some imports not used depending on template conditions
// @ts-ignore
import { DUMMY_BASE_URL, assertParamExists, setApiKeyToObject, setBasicAuthToObject, setBearerAuthToObject, setOAuthToObject, setSearchParams, serializeDataIfNeeded, toPathString, createRequestFunction } from '../common';
// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS, RequestArgs, BaseAPI, RequiredError } from '../base';
// @ts-ignore
import { APIError400 } from '../models';
// @ts-ignore
import { APIError401 } from '../models';
// @ts-ignore
import { APIError403 } from '../models';
// @ts-ignore
import { APIError404 } from '../models';
// @ts-ignore
import { APIError429 } from '../models';
// @ts-ignore
import { APIError500 } from '../models';
// @ts-ignore
import { QuotesForNFTsResult } from '../models';
// @ts-ignore
import { QuotesForStacksResult } from '../models';
/**
 * PricingApi - axios parameter creator
 * @export
 */
export const PricingApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * pricing data for a list of token ids
         * @summary Get pricing data for a list of token ids
         * @param {string} chainName The name of chain
         * @param {string} contractAddress Contract address for collection that these token ids are on
         * @param {Array<string>} tokenId List of token ids to get pricing data for
         * @param {string} [pageCursor] Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        quotesForNFTs: async (chainName: string, contractAddress: string, tokenId: Array<string>, pageCursor?: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'chainName' is not null or undefined
            assertParamExists('quotesForNFTs', 'chainName', chainName)
            // verify required parameter 'contractAddress' is not null or undefined
            assertParamExists('quotesForNFTs', 'contractAddress', contractAddress)
            // verify required parameter 'tokenId' is not null or undefined
            assertParamExists('quotesForNFTs', 'tokenId', tokenId)
            const localVarPath = `/v1/chains/{chain_name}/quotes/{contract_address}/nfts`
                .replace(`{${"chain_name"}}`, encodeURIComponent(String(chainName)))
                .replace(`{${"contract_address"}}`, encodeURIComponent(String(contractAddress)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            if (tokenId) {
                localVarQueryParameter['token_id'] = tokenId;
            }

            if (pageCursor !== undefined) {
                localVarQueryParameter['page_cursor'] = pageCursor;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Get pricing data for a list of stack ids
         * @summary Get pricing data for a list of stack ids
         * @param {string} chainName The name of chain
         * @param {string} contractAddress Contract address for collection that these stacks are on
         * @param {Array<string>} stackId List of stack ids to get pricing data for
         * @param {string} [pageCursor] Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        quotesForStacks: async (chainName: string, contractAddress: string, stackId: Array<string>, pageCursor?: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'chainName' is not null or undefined
            assertParamExists('quotesForStacks', 'chainName', chainName)
            // verify required parameter 'contractAddress' is not null or undefined
            assertParamExists('quotesForStacks', 'contractAddress', contractAddress)
            // verify required parameter 'stackId' is not null or undefined
            assertParamExists('quotesForStacks', 'stackId', stackId)
            const localVarPath = `/v1/chains/{chain_name}/quotes/{contract_address}/stacks`
                .replace(`{${"chain_name"}}`, encodeURIComponent(String(chainName)))
                .replace(`{${"contract_address"}}`, encodeURIComponent(String(contractAddress)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            if (stackId) {
                localVarQueryParameter['stack_id'] = stackId;
            }

            if (pageCursor !== undefined) {
                localVarQueryParameter['page_cursor'] = pageCursor;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * PricingApi - functional programming interface
 * @export
 */
export const PricingApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = PricingApiAxiosParamCreator(configuration)
    return {
        /**
         * pricing data for a list of token ids
         * @summary Get pricing data for a list of token ids
         * @param {string} chainName The name of chain
         * @param {string} contractAddress Contract address for collection that these token ids are on
         * @param {Array<string>} tokenId List of token ids to get pricing data for
         * @param {string} [pageCursor] Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async quotesForNFTs(chainName: string, contractAddress: string, tokenId: Array<string>, pageCursor?: string, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<QuotesForNFTsResult>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.quotesForNFTs(chainName, contractAddress, tokenId, pageCursor, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Get pricing data for a list of stack ids
         * @summary Get pricing data for a list of stack ids
         * @param {string} chainName The name of chain
         * @param {string} contractAddress Contract address for collection that these stacks are on
         * @param {Array<string>} stackId List of stack ids to get pricing data for
         * @param {string} [pageCursor] Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async quotesForStacks(chainName: string, contractAddress: string, stackId: Array<string>, pageCursor?: string, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<QuotesForStacksResult>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.quotesForStacks(chainName, contractAddress, stackId, pageCursor, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * PricingApi - factory interface
 * @export
 */
export const PricingApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = PricingApiFp(configuration)
    return {
        /**
         * pricing data for a list of token ids
         * @summary Get pricing data for a list of token ids
         * @param {PricingApiQuotesForNFTsRequest} requestParameters Request parameters.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        quotesForNFTs(requestParameters: PricingApiQuotesForNFTsRequest, options?: AxiosRequestConfig): AxiosPromise<QuotesForNFTsResult> {
            return localVarFp.quotesForNFTs(requestParameters.chainName, requestParameters.contractAddress, requestParameters.tokenId, requestParameters.pageCursor, options).then((request) => request(axios, basePath));
        },
        /**
         * Get pricing data for a list of stack ids
         * @summary Get pricing data for a list of stack ids
         * @param {PricingApiQuotesForStacksRequest} requestParameters Request parameters.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        quotesForStacks(requestParameters: PricingApiQuotesForStacksRequest, options?: AxiosRequestConfig): AxiosPromise<QuotesForStacksResult> {
            return localVarFp.quotesForStacks(requestParameters.chainName, requestParameters.contractAddress, requestParameters.stackId, requestParameters.pageCursor, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * Request parameters for quotesForNFTs operation in PricingApi.
 * @export
 * @interface PricingApiQuotesForNFTsRequest
 */
export interface PricingApiQuotesForNFTsRequest {
    /**
     * The name of chain
     * @type {string}
     * @memberof PricingApiQuotesForNFTs
     */
    readonly chainName: string

    /**
     * Contract address for collection that these token ids are on
     * @type {string}
     * @memberof PricingApiQuotesForNFTs
     */
    readonly contractAddress: string

    /**
     * List of token ids to get pricing data for
     * @type {Array<string>}
     * @memberof PricingApiQuotesForNFTs
     */
    readonly tokenId: Array<string>

    /**
     * Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
     * @type {string}
     * @memberof PricingApiQuotesForNFTs
     */
    readonly pageCursor?: string
}

/**
 * Request parameters for quotesForStacks operation in PricingApi.
 * @export
 * @interface PricingApiQuotesForStacksRequest
 */
export interface PricingApiQuotesForStacksRequest {
    /**
     * The name of chain
     * @type {string}
     * @memberof PricingApiQuotesForStacks
     */
    readonly chainName: string

    /**
     * Contract address for collection that these stacks are on
     * @type {string}
     * @memberof PricingApiQuotesForStacks
     */
    readonly contractAddress: string

    /**
     * List of stack ids to get pricing data for
     * @type {Array<string>}
     * @memberof PricingApiQuotesForStacks
     */
    readonly stackId: Array<string>

    /**
     * Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
     * @type {string}
     * @memberof PricingApiQuotesForStacks
     */
    readonly pageCursor?: string
}

/**
 * PricingApi - object-oriented interface
 * @export
 * @class PricingApi
 * @extends {BaseAPI}
 */
export class PricingApi extends BaseAPI {
    /**
     * pricing data for a list of token ids
     * @summary Get pricing data for a list of token ids
     * @param {PricingApiQuotesForNFTsRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PricingApi
     */
    public quotesForNFTs(requestParameters: PricingApiQuotesForNFTsRequest, options?: AxiosRequestConfig) {
        return PricingApiFp(this.configuration).quotesForNFTs(requestParameters.chainName, requestParameters.contractAddress, requestParameters.tokenId, requestParameters.pageCursor, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Get pricing data for a list of stack ids
     * @summary Get pricing data for a list of stack ids
     * @param {PricingApiQuotesForStacksRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PricingApi
     */
    public quotesForStacks(requestParameters: PricingApiQuotesForStacksRequest, options?: AxiosRequestConfig) {
        return PricingApiFp(this.configuration).quotesForStacks(requestParameters.chainName, requestParameters.contractAddress, requestParameters.stackId, requestParameters.pageCursor, options).then((request) => request(this.axios, this.basePath));
    }
}
