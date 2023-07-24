/* tslint:disable */
/* eslint-disable */
/**
 * Immutable X API
 * Immutable Multi Rollup API
 *
 * The version of the OpenAPI document: 1.0.0
 * Contact: support@immutable.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import globalAxios, { AxiosPromise, AxiosInstance, AxiosRequestConfig } from 'axios';
import { Configuration } from '../configuration';
// Some imports not used depending on template conditions
// @ts-ignore
import { DUMMY_BASE_URL, assertParamExists, setApiKeyToObject, setBasicAuthToObject, setBearerAuthToObject, setOAuthToObject, setSearchParams, serializeDataIfNeeded, toPathString, createRequestFunction } from '../common';
// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS, RequestArgs, BaseAPI, RequiredError } from '../base';
// @ts-ignore
import { APIError400 } from '../models';
// @ts-ignore
import { APIError404 } from '../models';
// @ts-ignore
import { APIError500 } from '../models';
// @ts-ignore
import { GetCollectionResult } from '../models';
// @ts-ignore
import { ListCollectionsResult } from '../models';
/**
 * CollectionsApi - axios parameter creator
 * @export
 */
export const CollectionsApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Get collection by contract address
         * @summary Get collection by contract address
         * @param {string} contractAddress The address contract
         * @param {string} chainName The name of chain
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getCollection: async (contractAddress: string, chainName: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'contractAddress' is not null or undefined
            assertParamExists('getCollection', 'contractAddress', contractAddress)
            // verify required parameter 'chainName' is not null or undefined
            assertParamExists('getCollection', 'chainName', chainName)
            const localVarPath = `/v1/chains/{chain_name}/collections/{contract_address}`
                .replace(`{${"contract_address"}}`, encodeURIComponent(String(contractAddress)))
                .replace(`{${"chain_name"}}`, encodeURIComponent(String(chainName)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * List all collections
         * @summary List all collections
         * @param {string} chainName The name of chain
         * @param {string} [pageCursor] Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
         * @param {number} [pageSize] Maximum number of items to return
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listCollections: async (chainName: string, pageCursor?: string, pageSize?: number, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'chainName' is not null or undefined
            assertParamExists('listCollections', 'chainName', chainName)
            const localVarPath = `/v1/chains/{chain_name}/collections`
                .replace(`{${"chain_name"}}`, encodeURIComponent(String(chainName)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            if (pageCursor !== undefined) {
                localVarQueryParameter['page_cursor'] = pageCursor;
            }

            if (pageSize !== undefined) {
                localVarQueryParameter['page_size'] = pageSize;
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
 * CollectionsApi - functional programming interface
 * @export
 */
export const CollectionsApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = CollectionsApiAxiosParamCreator(configuration)
    return {
        /**
         * Get collection by contract address
         * @summary Get collection by contract address
         * @param {string} contractAddress The address contract
         * @param {string} chainName The name of chain
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getCollection(contractAddress: string, chainName: string, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<GetCollectionResult>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getCollection(contractAddress, chainName, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * List all collections
         * @summary List all collections
         * @param {string} chainName The name of chain
         * @param {string} [pageCursor] Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
         * @param {number} [pageSize] Maximum number of items to return
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async listCollections(chainName: string, pageCursor?: string, pageSize?: number, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<ListCollectionsResult>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.listCollections(chainName, pageCursor, pageSize, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * CollectionsApi - factory interface
 * @export
 */
export const CollectionsApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = CollectionsApiFp(configuration)
    return {
        /**
         * Get collection by contract address
         * @summary Get collection by contract address
         * @param {string} contractAddress The address contract
         * @param {string} chainName The name of chain
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getCollection(contractAddress: string, chainName: string, options?: any): AxiosPromise<GetCollectionResult> {
            return localVarFp.getCollection(contractAddress, chainName, options).then((request) => request(axios, basePath));
        },
        /**
         * List all collections
         * @summary List all collections
         * @param {string} chainName The name of chain
         * @param {string} [pageCursor] Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
         * @param {number} [pageSize] Maximum number of items to return
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listCollections(chainName: string, pageCursor?: string, pageSize?: number, options?: any): AxiosPromise<ListCollectionsResult> {
            return localVarFp.listCollections(chainName, pageCursor, pageSize, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * Request parameters for getCollection operation in CollectionsApi.
 * @export
 * @interface CollectionsApiGetCollectionRequest
 */
export interface CollectionsApiGetCollectionRequest {
    /**
     * The address contract
     * @type {string}
     * @memberof CollectionsApiGetCollection
     */
    readonly contractAddress: string

    /**
     * The name of chain
     * @type {string}
     * @memberof CollectionsApiGetCollection
     */
    readonly chainName: string
}

/**
 * Request parameters for listCollections operation in CollectionsApi.
 * @export
 * @interface CollectionsApiListCollectionsRequest
 */
export interface CollectionsApiListCollectionsRequest {
    /**
     * The name of chain
     * @type {string}
     * @memberof CollectionsApiListCollections
     */
    readonly chainName: string

    /**
     * Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
     * @type {string}
     * @memberof CollectionsApiListCollections
     */
    readonly pageCursor?: string

    /**
     * Maximum number of items to return
     * @type {number}
     * @memberof CollectionsApiListCollections
     */
    readonly pageSize?: number
}

/**
 * CollectionsApi - object-oriented interface
 * @export
 * @class CollectionsApi
 * @extends {BaseAPI}
 */
export class CollectionsApi extends BaseAPI {
    /**
     * Get collection by contract address
     * @summary Get collection by contract address
     * @param {CollectionsApiGetCollectionRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof CollectionsApi
     */
    public getCollection(requestParameters: CollectionsApiGetCollectionRequest, options?: AxiosRequestConfig) {
        return CollectionsApiFp(this.configuration).getCollection(requestParameters.contractAddress, requestParameters.chainName, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * List all collections
     * @summary List all collections
     * @param {CollectionsApiListCollectionsRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof CollectionsApi
     */
    public listCollections(requestParameters: CollectionsApiListCollectionsRequest, options?: AxiosRequestConfig) {
        return CollectionsApiFp(this.configuration).listCollections(requestParameters.chainName, requestParameters.pageCursor, requestParameters.pageSize, options).then((request) => request(this.axios, this.basePath));
    }
}
