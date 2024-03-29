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


import globalAxios, { AxiosPromise, AxiosInstance, AxiosRequestConfig } from 'axios';
import { Configuration } from '../configuration';
// Some imports not used depending on template conditions
// @ts-ignore
import { DUMMY_BASE_URL, assertParamExists, setApiKeyToObject, setBasicAuthToObject, setBearerAuthToObject, setOAuthToObject, setSearchParams, serializeDataIfNeeded, toPathString, createRequestFunction } from '../common';
// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS, RequestArgs, BaseAPI, RequiredError } from '../base';
// @ts-ignore
import { APIError } from '../models';
// @ts-ignore
import { CreateMetadataRefreshRequest } from '../models';
// @ts-ignore
import { CreateMetadataRefreshResponse } from '../models';
// @ts-ignore
import { GetMetadataRefreshErrorsResponse } from '../models';
// @ts-ignore
import { GetMetadataRefreshResponse } from '../models';
// @ts-ignore
import { GetMetadataRefreshes } from '../models';
/**
 * MetadataRefreshesApi - axios parameter creator
 * @export
 */
export const MetadataRefreshesApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Get a list of metadata refreshes
         * @param {string} xImxEthSignature String created by signing wallet address and timestamp. See https://docs.x.immutable.com/docs/generate-imx-signature
         * @param {string} xImxEthTimestamp Unix Epoc timestamp
         * @param {string} xImxEthAddress Wallet Address that signed the signature
         * @param {number} [pageSize] Page size of the result
         * @param {string} [cursor] Cursor
         * @param {string} [collectionAddress] Collection address
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getAListOfMetadataRefreshes: async (xImxEthSignature: string, xImxEthTimestamp: string, xImxEthAddress: string, pageSize?: number, cursor?: string, collectionAddress?: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'xImxEthSignature' is not null or undefined
            assertParamExists('getAListOfMetadataRefreshes', 'xImxEthSignature', xImxEthSignature)
            // verify required parameter 'xImxEthTimestamp' is not null or undefined
            assertParamExists('getAListOfMetadataRefreshes', 'xImxEthTimestamp', xImxEthTimestamp)
            // verify required parameter 'xImxEthAddress' is not null or undefined
            assertParamExists('getAListOfMetadataRefreshes', 'xImxEthAddress', xImxEthAddress)
            const localVarPath = `/v1/metadata-refreshes`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            if (pageSize !== undefined) {
                localVarQueryParameter['page_size'] = pageSize;
            }

            if (cursor !== undefined) {
                localVarQueryParameter['cursor'] = cursor;
            }

            if (collectionAddress !== undefined) {
                localVarQueryParameter['collection_address'] = collectionAddress;
            }

            if (xImxEthSignature != null) {
                localVarHeaderParameter['x-imx-eth-signature'] = String(xImxEthSignature);
            }

            if (xImxEthTimestamp != null) {
                localVarHeaderParameter['x-imx-eth-timestamp'] = String(xImxEthTimestamp);
            }

            if (xImxEthAddress != null) {
                localVarHeaderParameter['x-imx-eth-address'] = String(xImxEthAddress);
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
         * Get metadata refresh errors
         * @param {string} refreshId The metadata refresh ID
         * @param {string} xImxEthSignature String created by signing wallet address and timestamp. See https://docs.x.immutable.com/docs/generate-imx-signature
         * @param {string} xImxEthTimestamp Unix Epoc timestamp
         * @param {string} xImxEthAddress Wallet Address that signed the signature
         * @param {number} [pageSize] Page size of the result
         * @param {string} [cursor] Cursor
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getMetadataRefreshErrors: async (refreshId: string, xImxEthSignature: string, xImxEthTimestamp: string, xImxEthAddress: string, pageSize?: number, cursor?: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'refreshId' is not null or undefined
            assertParamExists('getMetadataRefreshErrors', 'refreshId', refreshId)
            // verify required parameter 'xImxEthSignature' is not null or undefined
            assertParamExists('getMetadataRefreshErrors', 'xImxEthSignature', xImxEthSignature)
            // verify required parameter 'xImxEthTimestamp' is not null or undefined
            assertParamExists('getMetadataRefreshErrors', 'xImxEthTimestamp', xImxEthTimestamp)
            // verify required parameter 'xImxEthAddress' is not null or undefined
            assertParamExists('getMetadataRefreshErrors', 'xImxEthAddress', xImxEthAddress)
            const localVarPath = `/v1/metadata-refreshes/{refresh_id}/errors`
                .replace(`{${"refresh_id"}}`, encodeURIComponent(String(refreshId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            if (pageSize !== undefined) {
                localVarQueryParameter['page_size'] = pageSize;
            }

            if (cursor !== undefined) {
                localVarQueryParameter['cursor'] = cursor;
            }

            if (xImxEthSignature != null) {
                localVarHeaderParameter['x-imx-eth-signature'] = String(xImxEthSignature);
            }

            if (xImxEthTimestamp != null) {
                localVarHeaderParameter['x-imx-eth-timestamp'] = String(xImxEthTimestamp);
            }

            if (xImxEthAddress != null) {
                localVarHeaderParameter['x-imx-eth-address'] = String(xImxEthAddress);
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
         * Get metadata refresh results
         * @param {string} refreshId The metadata refresh ID
         * @param {string} xImxEthSignature String created by signing wallet address and timestamp. See https://docs.x.immutable.com/docs/generate-imx-signature
         * @param {string} xImxEthTimestamp Unix Epoc timestamp
         * @param {string} xImxEthAddress Wallet Address that signed the signature
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getMetadataRefreshResults: async (refreshId: string, xImxEthSignature: string, xImxEthTimestamp: string, xImxEthAddress: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'refreshId' is not null or undefined
            assertParamExists('getMetadataRefreshResults', 'refreshId', refreshId)
            // verify required parameter 'xImxEthSignature' is not null or undefined
            assertParamExists('getMetadataRefreshResults', 'xImxEthSignature', xImxEthSignature)
            // verify required parameter 'xImxEthTimestamp' is not null or undefined
            assertParamExists('getMetadataRefreshResults', 'xImxEthTimestamp', xImxEthTimestamp)
            // verify required parameter 'xImxEthAddress' is not null or undefined
            assertParamExists('getMetadataRefreshResults', 'xImxEthAddress', xImxEthAddress)
            const localVarPath = `/v1/metadata-refreshes/{refresh_id}`
                .replace(`{${"refresh_id"}}`, encodeURIComponent(String(refreshId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            if (xImxEthSignature != null) {
                localVarHeaderParameter['x-imx-eth-signature'] = String(xImxEthSignature);
            }

            if (xImxEthTimestamp != null) {
                localVarHeaderParameter['x-imx-eth-timestamp'] = String(xImxEthTimestamp);
            }

            if (xImxEthAddress != null) {
                localVarHeaderParameter['x-imx-eth-address'] = String(xImxEthAddress);
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
         * Request metadata refresh for provided tokens
         * @param {string} xImxEthSignature String created by signing wallet address and timestamp. See https://docs.x.immutable.com/docs/generate-imx-signature
         * @param {string} xImxEthTimestamp Unix Epoc timestamp
         * @param {string} xImxEthAddress Wallet Address that signed the signature
         * @param {CreateMetadataRefreshRequest} createMetadataRefreshRequest Create metadata refresh request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        requestAMetadataRefresh: async (xImxEthSignature: string, xImxEthTimestamp: string, xImxEthAddress: string, createMetadataRefreshRequest: CreateMetadataRefreshRequest, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'xImxEthSignature' is not null or undefined
            assertParamExists('requestAMetadataRefresh', 'xImxEthSignature', xImxEthSignature)
            // verify required parameter 'xImxEthTimestamp' is not null or undefined
            assertParamExists('requestAMetadataRefresh', 'xImxEthTimestamp', xImxEthTimestamp)
            // verify required parameter 'xImxEthAddress' is not null or undefined
            assertParamExists('requestAMetadataRefresh', 'xImxEthAddress', xImxEthAddress)
            // verify required parameter 'createMetadataRefreshRequest' is not null or undefined
            assertParamExists('requestAMetadataRefresh', 'createMetadataRefreshRequest', createMetadataRefreshRequest)
            const localVarPath = `/v1/metadata-refreshes`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            if (xImxEthSignature != null) {
                localVarHeaderParameter['x-imx-eth-signature'] = String(xImxEthSignature);
            }

            if (xImxEthTimestamp != null) {
                localVarHeaderParameter['x-imx-eth-timestamp'] = String(xImxEthTimestamp);
            }

            if (xImxEthAddress != null) {
                localVarHeaderParameter['x-imx-eth-address'] = String(xImxEthAddress);
            }


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(createMetadataRefreshRequest, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * MetadataRefreshesApi - functional programming interface
 * @export
 */
export const MetadataRefreshesApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = MetadataRefreshesApiAxiosParamCreator(configuration)
    return {
        /**
         * Get a list of metadata refreshes
         * @param {string} xImxEthSignature String created by signing wallet address and timestamp. See https://docs.x.immutable.com/docs/generate-imx-signature
         * @param {string} xImxEthTimestamp Unix Epoc timestamp
         * @param {string} xImxEthAddress Wallet Address that signed the signature
         * @param {number} [pageSize] Page size of the result
         * @param {string} [cursor] Cursor
         * @param {string} [collectionAddress] Collection address
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getAListOfMetadataRefreshes(xImxEthSignature: string, xImxEthTimestamp: string, xImxEthAddress: string, pageSize?: number, cursor?: string, collectionAddress?: string, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<GetMetadataRefreshes>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getAListOfMetadataRefreshes(xImxEthSignature, xImxEthTimestamp, xImxEthAddress, pageSize, cursor, collectionAddress, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Get metadata refresh errors
         * @param {string} refreshId The metadata refresh ID
         * @param {string} xImxEthSignature String created by signing wallet address and timestamp. See https://docs.x.immutable.com/docs/generate-imx-signature
         * @param {string} xImxEthTimestamp Unix Epoc timestamp
         * @param {string} xImxEthAddress Wallet Address that signed the signature
         * @param {number} [pageSize] Page size of the result
         * @param {string} [cursor] Cursor
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getMetadataRefreshErrors(refreshId: string, xImxEthSignature: string, xImxEthTimestamp: string, xImxEthAddress: string, pageSize?: number, cursor?: string, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<GetMetadataRefreshErrorsResponse>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getMetadataRefreshErrors(refreshId, xImxEthSignature, xImxEthTimestamp, xImxEthAddress, pageSize, cursor, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Get metadata refresh results
         * @param {string} refreshId The metadata refresh ID
         * @param {string} xImxEthSignature String created by signing wallet address and timestamp. See https://docs.x.immutable.com/docs/generate-imx-signature
         * @param {string} xImxEthTimestamp Unix Epoc timestamp
         * @param {string} xImxEthAddress Wallet Address that signed the signature
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getMetadataRefreshResults(refreshId: string, xImxEthSignature: string, xImxEthTimestamp: string, xImxEthAddress: string, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<GetMetadataRefreshResponse>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getMetadataRefreshResults(refreshId, xImxEthSignature, xImxEthTimestamp, xImxEthAddress, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Request metadata refresh for provided tokens
         * @param {string} xImxEthSignature String created by signing wallet address and timestamp. See https://docs.x.immutable.com/docs/generate-imx-signature
         * @param {string} xImxEthTimestamp Unix Epoc timestamp
         * @param {string} xImxEthAddress Wallet Address that signed the signature
         * @param {CreateMetadataRefreshRequest} createMetadataRefreshRequest Create metadata refresh request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async requestAMetadataRefresh(xImxEthSignature: string, xImxEthTimestamp: string, xImxEthAddress: string, createMetadataRefreshRequest: CreateMetadataRefreshRequest, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<CreateMetadataRefreshResponse>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.requestAMetadataRefresh(xImxEthSignature, xImxEthTimestamp, xImxEthAddress, createMetadataRefreshRequest, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * MetadataRefreshesApi - factory interface
 * @export
 */
export const MetadataRefreshesApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = MetadataRefreshesApiFp(configuration)
    return {
        /**
         * Get a list of metadata refreshes
         * @param {string} xImxEthSignature String created by signing wallet address and timestamp. See https://docs.x.immutable.com/docs/generate-imx-signature
         * @param {string} xImxEthTimestamp Unix Epoc timestamp
         * @param {string} xImxEthAddress Wallet Address that signed the signature
         * @param {number} [pageSize] Page size of the result
         * @param {string} [cursor] Cursor
         * @param {string} [collectionAddress] Collection address
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getAListOfMetadataRefreshes(xImxEthSignature: string, xImxEthTimestamp: string, xImxEthAddress: string, pageSize?: number, cursor?: string, collectionAddress?: string, options?: any): AxiosPromise<GetMetadataRefreshes> {
            return localVarFp.getAListOfMetadataRefreshes(xImxEthSignature, xImxEthTimestamp, xImxEthAddress, pageSize, cursor, collectionAddress, options).then((request) => request(axios, basePath));
        },
        /**
         * Get metadata refresh errors
         * @param {string} refreshId The metadata refresh ID
         * @param {string} xImxEthSignature String created by signing wallet address and timestamp. See https://docs.x.immutable.com/docs/generate-imx-signature
         * @param {string} xImxEthTimestamp Unix Epoc timestamp
         * @param {string} xImxEthAddress Wallet Address that signed the signature
         * @param {number} [pageSize] Page size of the result
         * @param {string} [cursor] Cursor
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getMetadataRefreshErrors(refreshId: string, xImxEthSignature: string, xImxEthTimestamp: string, xImxEthAddress: string, pageSize?: number, cursor?: string, options?: any): AxiosPromise<GetMetadataRefreshErrorsResponse> {
            return localVarFp.getMetadataRefreshErrors(refreshId, xImxEthSignature, xImxEthTimestamp, xImxEthAddress, pageSize, cursor, options).then((request) => request(axios, basePath));
        },
        /**
         * Get metadata refresh results
         * @param {string} refreshId The metadata refresh ID
         * @param {string} xImxEthSignature String created by signing wallet address and timestamp. See https://docs.x.immutable.com/docs/generate-imx-signature
         * @param {string} xImxEthTimestamp Unix Epoc timestamp
         * @param {string} xImxEthAddress Wallet Address that signed the signature
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getMetadataRefreshResults(refreshId: string, xImxEthSignature: string, xImxEthTimestamp: string, xImxEthAddress: string, options?: any): AxiosPromise<GetMetadataRefreshResponse> {
            return localVarFp.getMetadataRefreshResults(refreshId, xImxEthSignature, xImxEthTimestamp, xImxEthAddress, options).then((request) => request(axios, basePath));
        },
        /**
         * Request metadata refresh for provided tokens
         * @param {string} xImxEthSignature String created by signing wallet address and timestamp. See https://docs.x.immutable.com/docs/generate-imx-signature
         * @param {string} xImxEthTimestamp Unix Epoc timestamp
         * @param {string} xImxEthAddress Wallet Address that signed the signature
         * @param {CreateMetadataRefreshRequest} createMetadataRefreshRequest Create metadata refresh request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        requestAMetadataRefresh(xImxEthSignature: string, xImxEthTimestamp: string, xImxEthAddress: string, createMetadataRefreshRequest: CreateMetadataRefreshRequest, options?: any): AxiosPromise<CreateMetadataRefreshResponse> {
            return localVarFp.requestAMetadataRefresh(xImxEthSignature, xImxEthTimestamp, xImxEthAddress, createMetadataRefreshRequest, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * Request parameters for getAListOfMetadataRefreshes operation in MetadataRefreshesApi.
 * @export
 * @interface MetadataRefreshesApiGetAListOfMetadataRefreshesRequest
 */
export interface MetadataRefreshesApiGetAListOfMetadataRefreshesRequest {
    /**
     * String created by signing wallet address and timestamp. See https://docs.x.immutable.com/docs/generate-imx-signature
     * @type {string}
     * @memberof MetadataRefreshesApiGetAListOfMetadataRefreshes
     */
    readonly xImxEthSignature: string

    /**
     * Unix Epoc timestamp
     * @type {string}
     * @memberof MetadataRefreshesApiGetAListOfMetadataRefreshes
     */
    readonly xImxEthTimestamp: string

    /**
     * Wallet Address that signed the signature
     * @type {string}
     * @memberof MetadataRefreshesApiGetAListOfMetadataRefreshes
     */
    readonly xImxEthAddress: string

    /**
     * Page size of the result
     * @type {number}
     * @memberof MetadataRefreshesApiGetAListOfMetadataRefreshes
     */
    readonly pageSize?: number

    /**
     * Cursor
     * @type {string}
     * @memberof MetadataRefreshesApiGetAListOfMetadataRefreshes
     */
    readonly cursor?: string

    /**
     * Collection address
     * @type {string}
     * @memberof MetadataRefreshesApiGetAListOfMetadataRefreshes
     */
    readonly collectionAddress?: string
}

/**
 * Request parameters for getMetadataRefreshErrors operation in MetadataRefreshesApi.
 * @export
 * @interface MetadataRefreshesApiGetMetadataRefreshErrorsRequest
 */
export interface MetadataRefreshesApiGetMetadataRefreshErrorsRequest {
    /**
     * The metadata refresh ID
     * @type {string}
     * @memberof MetadataRefreshesApiGetMetadataRefreshErrors
     */
    readonly refreshId: string

    /**
     * String created by signing wallet address and timestamp. See https://docs.x.immutable.com/docs/generate-imx-signature
     * @type {string}
     * @memberof MetadataRefreshesApiGetMetadataRefreshErrors
     */
    readonly xImxEthSignature: string

    /**
     * Unix Epoc timestamp
     * @type {string}
     * @memberof MetadataRefreshesApiGetMetadataRefreshErrors
     */
    readonly xImxEthTimestamp: string

    /**
     * Wallet Address that signed the signature
     * @type {string}
     * @memberof MetadataRefreshesApiGetMetadataRefreshErrors
     */
    readonly xImxEthAddress: string

    /**
     * Page size of the result
     * @type {number}
     * @memberof MetadataRefreshesApiGetMetadataRefreshErrors
     */
    readonly pageSize?: number

    /**
     * Cursor
     * @type {string}
     * @memberof MetadataRefreshesApiGetMetadataRefreshErrors
     */
    readonly cursor?: string
}

/**
 * Request parameters for getMetadataRefreshResults operation in MetadataRefreshesApi.
 * @export
 * @interface MetadataRefreshesApiGetMetadataRefreshResultsRequest
 */
export interface MetadataRefreshesApiGetMetadataRefreshResultsRequest {
    /**
     * The metadata refresh ID
     * @type {string}
     * @memberof MetadataRefreshesApiGetMetadataRefreshResults
     */
    readonly refreshId: string

    /**
     * String created by signing wallet address and timestamp. See https://docs.x.immutable.com/docs/generate-imx-signature
     * @type {string}
     * @memberof MetadataRefreshesApiGetMetadataRefreshResults
     */
    readonly xImxEthSignature: string

    /**
     * Unix Epoc timestamp
     * @type {string}
     * @memberof MetadataRefreshesApiGetMetadataRefreshResults
     */
    readonly xImxEthTimestamp: string

    /**
     * Wallet Address that signed the signature
     * @type {string}
     * @memberof MetadataRefreshesApiGetMetadataRefreshResults
     */
    readonly xImxEthAddress: string
}

/**
 * Request parameters for requestAMetadataRefresh operation in MetadataRefreshesApi.
 * @export
 * @interface MetadataRefreshesApiRequestAMetadataRefreshRequest
 */
export interface MetadataRefreshesApiRequestAMetadataRefreshRequest {
    /**
     * String created by signing wallet address and timestamp. See https://docs.x.immutable.com/docs/generate-imx-signature
     * @type {string}
     * @memberof MetadataRefreshesApiRequestAMetadataRefresh
     */
    readonly xImxEthSignature: string

    /**
     * Unix Epoc timestamp
     * @type {string}
     * @memberof MetadataRefreshesApiRequestAMetadataRefresh
     */
    readonly xImxEthTimestamp: string

    /**
     * Wallet Address that signed the signature
     * @type {string}
     * @memberof MetadataRefreshesApiRequestAMetadataRefresh
     */
    readonly xImxEthAddress: string

    /**
     * Create metadata refresh request
     * @type {CreateMetadataRefreshRequest}
     * @memberof MetadataRefreshesApiRequestAMetadataRefresh
     */
    readonly createMetadataRefreshRequest: CreateMetadataRefreshRequest
}

/**
 * MetadataRefreshesApi - object-oriented interface
 * @export
 * @class MetadataRefreshesApi
 * @extends {BaseAPI}
 */
export class MetadataRefreshesApi extends BaseAPI {
    /**
     * Get a list of metadata refreshes
     * @param {MetadataRefreshesApiGetAListOfMetadataRefreshesRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof MetadataRefreshesApi
     */
    public getAListOfMetadataRefreshes(requestParameters: MetadataRefreshesApiGetAListOfMetadataRefreshesRequest, options?: AxiosRequestConfig) {
        return MetadataRefreshesApiFp(this.configuration).getAListOfMetadataRefreshes(requestParameters.xImxEthSignature, requestParameters.xImxEthTimestamp, requestParameters.xImxEthAddress, requestParameters.pageSize, requestParameters.cursor, requestParameters.collectionAddress, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Get metadata refresh errors
     * @param {MetadataRefreshesApiGetMetadataRefreshErrorsRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof MetadataRefreshesApi
     */
    public getMetadataRefreshErrors(requestParameters: MetadataRefreshesApiGetMetadataRefreshErrorsRequest, options?: AxiosRequestConfig) {
        return MetadataRefreshesApiFp(this.configuration).getMetadataRefreshErrors(requestParameters.refreshId, requestParameters.xImxEthSignature, requestParameters.xImxEthTimestamp, requestParameters.xImxEthAddress, requestParameters.pageSize, requestParameters.cursor, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Get metadata refresh results
     * @param {MetadataRefreshesApiGetMetadataRefreshResultsRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof MetadataRefreshesApi
     */
    public getMetadataRefreshResults(requestParameters: MetadataRefreshesApiGetMetadataRefreshResultsRequest, options?: AxiosRequestConfig) {
        return MetadataRefreshesApiFp(this.configuration).getMetadataRefreshResults(requestParameters.refreshId, requestParameters.xImxEthSignature, requestParameters.xImxEthTimestamp, requestParameters.xImxEthAddress, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Request metadata refresh for provided tokens
     * @param {MetadataRefreshesApiRequestAMetadataRefreshRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof MetadataRefreshesApi
     */
    public requestAMetadataRefresh(requestParameters: MetadataRefreshesApiRequestAMetadataRefreshRequest, options?: AxiosRequestConfig) {
        return MetadataRefreshesApiFp(this.configuration).requestAMetadataRefresh(requestParameters.xImxEthSignature, requestParameters.xImxEthTimestamp, requestParameters.xImxEthAddress, requestParameters.createMetadataRefreshRequest, options).then((request) => request(this.axios, this.basePath));
    }
}
