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
import { BasicAPIError } from '../models';
// @ts-ignore
import { CreateCounterfactualAddressRequest } from '../models';
// @ts-ignore
import { CreateCounterfactualAddressRes } from '../models';
// @ts-ignore
import { GetLinkedAddressesRes } from '../models';
// @ts-ignore
import { GetLinkedAddressesResDeprecated } from '../models';
// @ts-ignore
import { GetTransactionMetadataRequest } from '../models';
// @ts-ignore
import { GetTransactionMetadataRes } from '../models';
// @ts-ignore
import { GetTypedDataMetadataRequest } from '../models';
// @ts-ignore
import { GetTypedDataMetadataRes } from '../models';
/**
 * PassportApi - axios parameter creator
 * @export
 */
export const PassportApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Create a counterfactual address for a user based on their Ethereum address
         * @summary Create a counterfactual address v2
         * @param {string} chainName 
         * @param {CreateCounterfactualAddressRequest} createCounterfactualAddressRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createCounterfactualAddressV2: async (chainName: string, createCounterfactualAddressRequest: CreateCounterfactualAddressRequest, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'chainName' is not null or undefined
            assertParamExists('createCounterfactualAddressV2', 'chainName', chainName)
            // verify required parameter 'createCounterfactualAddressRequest' is not null or undefined
            assertParamExists('createCounterfactualAddressV2', 'createCounterfactualAddressRequest', createCounterfactualAddressRequest)
            const localVarPath = `/v2/chains/{chain_name}/passport/counterfactual-address`
                .replace(`{${"chain_name"}}`, encodeURIComponent(String(chainName)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication BearerAuth required
            // http bearer authentication required
            await setBearerAuthToObject(localVarHeaderParameter, configuration)


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(createCounterfactualAddressRequest, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * This API has been deprecated, please use https://docs.immutable.com/zkevm/api/reference/#/operations/getUserInfo instead to get a list of linked addresses.
         * @summary Get Ethereum linked addresses for a user
         * @param {string} userId The user\&#39;s userId
         * @param {string} chainName 
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        getLinkedAddresses: async (userId: string, chainName: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'userId' is not null or undefined
            assertParamExists('getLinkedAddresses', 'userId', userId)
            // verify required parameter 'chainName' is not null or undefined
            assertParamExists('getLinkedAddresses', 'chainName', chainName)
            const localVarPath = `/v1/chains/{chain_name}/passport/users/{user_id}/linked-addresses`
                .replace(`{${"user_id"}}`, encodeURIComponent(String(userId)))
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

            // authentication BearerAuth required
            // http bearer authentication required
            await setBearerAuthToObject(localVarHeaderParameter, configuration)


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Get all the Ethereum linked addresses for a user based on its userId
         * @summary Deprecated Get Ethereum linked addresses for a user
         * @param {string} userId The user\&#39;s userId
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        getLinkedAddressesDeprecated: async (userId: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'userId' is not null or undefined
            assertParamExists('getLinkedAddressesDeprecated', 'userId', userId)
            const localVarPath = `/passport-mr/v1/users/{userId}/linked-addresses`
                .replace(`{${"userId"}}`, encodeURIComponent(String(userId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication BearerAuth required
            // http bearer authentication required
            await setBearerAuthToObject(localVarHeaderParameter, configuration)


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Get transaction metadata for a given encoded transaction
         * @summary Get transaction metadata
         * @param {string} chainName 
         * @param {GetTransactionMetadataRequest} getTransactionMetadataRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getTransactionMetadata: async (chainName: string, getTransactionMetadataRequest: GetTransactionMetadataRequest, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'chainName' is not null or undefined
            assertParamExists('getTransactionMetadata', 'chainName', chainName)
            // verify required parameter 'getTransactionMetadataRequest' is not null or undefined
            assertParamExists('getTransactionMetadata', 'getTransactionMetadataRequest', getTransactionMetadataRequest)
            const localVarPath = `/v1/chains/{chain_name}/passport/transaction-metadata`
                .replace(`{${"chain_name"}}`, encodeURIComponent(String(chainName)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication BearerAuth required
            // http bearer authentication required
            await setBearerAuthToObject(localVarHeaderParameter, configuration)


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(getTransactionMetadataRequest, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Get typeddata metadata for a given encoded typeddata
         * @summary Get typeddata metadata
         * @param {string} chainName 
         * @param {GetTypedDataMetadataRequest} getTypedDataMetadataRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getTypedDataMetadata: async (chainName: string, getTypedDataMetadataRequest: GetTypedDataMetadataRequest, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'chainName' is not null or undefined
            assertParamExists('getTypedDataMetadata', 'chainName', chainName)
            // verify required parameter 'getTypedDataMetadataRequest' is not null or undefined
            assertParamExists('getTypedDataMetadata', 'getTypedDataMetadataRequest', getTypedDataMetadataRequest)
            const localVarPath = `/v1/chains/{chain_name}/passport/typeddata-metadata`
                .replace(`{${"chain_name"}}`, encodeURIComponent(String(chainName)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication BearerAuth required
            // http bearer authentication required
            await setBearerAuthToObject(localVarHeaderParameter, configuration)


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(getTypedDataMetadataRequest, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * PassportApi - functional programming interface
 * @export
 */
export const PassportApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = PassportApiAxiosParamCreator(configuration)
    return {
        /**
         * Create a counterfactual address for a user based on their Ethereum address
         * @summary Create a counterfactual address v2
         * @param {string} chainName 
         * @param {CreateCounterfactualAddressRequest} createCounterfactualAddressRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async createCounterfactualAddressV2(chainName: string, createCounterfactualAddressRequest: CreateCounterfactualAddressRequest, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<CreateCounterfactualAddressRes>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.createCounterfactualAddressV2(chainName, createCounterfactualAddressRequest, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * This API has been deprecated, please use https://docs.immutable.com/zkevm/api/reference/#/operations/getUserInfo instead to get a list of linked addresses.
         * @summary Get Ethereum linked addresses for a user
         * @param {string} userId The user\&#39;s userId
         * @param {string} chainName 
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        async getLinkedAddresses(userId: string, chainName: string, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<GetLinkedAddressesRes>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getLinkedAddresses(userId, chainName, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Get all the Ethereum linked addresses for a user based on its userId
         * @summary Deprecated Get Ethereum linked addresses for a user
         * @param {string} userId The user\&#39;s userId
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        async getLinkedAddressesDeprecated(userId: string, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<GetLinkedAddressesResDeprecated>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getLinkedAddressesDeprecated(userId, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Get transaction metadata for a given encoded transaction
         * @summary Get transaction metadata
         * @param {string} chainName 
         * @param {GetTransactionMetadataRequest} getTransactionMetadataRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getTransactionMetadata(chainName: string, getTransactionMetadataRequest: GetTransactionMetadataRequest, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<GetTransactionMetadataRes>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getTransactionMetadata(chainName, getTransactionMetadataRequest, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Get typeddata metadata for a given encoded typeddata
         * @summary Get typeddata metadata
         * @param {string} chainName 
         * @param {GetTypedDataMetadataRequest} getTypedDataMetadataRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getTypedDataMetadata(chainName: string, getTypedDataMetadataRequest: GetTypedDataMetadataRequest, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<GetTypedDataMetadataRes>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getTypedDataMetadata(chainName, getTypedDataMetadataRequest, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * PassportApi - factory interface
 * @export
 */
export const PassportApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = PassportApiFp(configuration)
    return {
        /**
         * Create a counterfactual address for a user based on their Ethereum address
         * @summary Create a counterfactual address v2
         * @param {PassportApiCreateCounterfactualAddressV2Request} requestParameters Request parameters.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createCounterfactualAddressV2(requestParameters: PassportApiCreateCounterfactualAddressV2Request, options?: AxiosRequestConfig): AxiosPromise<CreateCounterfactualAddressRes> {
            return localVarFp.createCounterfactualAddressV2(requestParameters.chainName, requestParameters.createCounterfactualAddressRequest, options).then((request) => request(axios, basePath));
        },
        /**
         * This API has been deprecated, please use https://docs.immutable.com/zkevm/api/reference/#/operations/getUserInfo instead to get a list of linked addresses.
         * @summary Get Ethereum linked addresses for a user
         * @param {PassportApiGetLinkedAddressesRequest} requestParameters Request parameters.
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        getLinkedAddresses(requestParameters: PassportApiGetLinkedAddressesRequest, options?: AxiosRequestConfig): AxiosPromise<GetLinkedAddressesRes> {
            return localVarFp.getLinkedAddresses(requestParameters.userId, requestParameters.chainName, options).then((request) => request(axios, basePath));
        },
        /**
         * Get all the Ethereum linked addresses for a user based on its userId
         * @summary Deprecated Get Ethereum linked addresses for a user
         * @param {PassportApiGetLinkedAddressesDeprecatedRequest} requestParameters Request parameters.
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        getLinkedAddressesDeprecated(requestParameters: PassportApiGetLinkedAddressesDeprecatedRequest, options?: AxiosRequestConfig): AxiosPromise<GetLinkedAddressesResDeprecated> {
            return localVarFp.getLinkedAddressesDeprecated(requestParameters.userId, options).then((request) => request(axios, basePath));
        },
        /**
         * Get transaction metadata for a given encoded transaction
         * @summary Get transaction metadata
         * @param {PassportApiGetTransactionMetadataRequest} requestParameters Request parameters.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getTransactionMetadata(requestParameters: PassportApiGetTransactionMetadataRequest, options?: AxiosRequestConfig): AxiosPromise<GetTransactionMetadataRes> {
            return localVarFp.getTransactionMetadata(requestParameters.chainName, requestParameters.getTransactionMetadataRequest, options).then((request) => request(axios, basePath));
        },
        /**
         * Get typeddata metadata for a given encoded typeddata
         * @summary Get typeddata metadata
         * @param {PassportApiGetTypedDataMetadataRequest} requestParameters Request parameters.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getTypedDataMetadata(requestParameters: PassportApiGetTypedDataMetadataRequest, options?: AxiosRequestConfig): AxiosPromise<GetTypedDataMetadataRes> {
            return localVarFp.getTypedDataMetadata(requestParameters.chainName, requestParameters.getTypedDataMetadataRequest, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * Request parameters for createCounterfactualAddressV2 operation in PassportApi.
 * @export
 * @interface PassportApiCreateCounterfactualAddressV2Request
 */
export interface PassportApiCreateCounterfactualAddressV2Request {
    /**
     * 
     * @type {string}
     * @memberof PassportApiCreateCounterfactualAddressV2
     */
    readonly chainName: string

    /**
     * 
     * @type {CreateCounterfactualAddressRequest}
     * @memberof PassportApiCreateCounterfactualAddressV2
     */
    readonly createCounterfactualAddressRequest: CreateCounterfactualAddressRequest
}

/**
 * Request parameters for getLinkedAddresses operation in PassportApi.
 * @export
 * @interface PassportApiGetLinkedAddressesRequest
 */
export interface PassportApiGetLinkedAddressesRequest {
    /**
     * The user\&#39;s userId
     * @type {string}
     * @memberof PassportApiGetLinkedAddresses
     */
    readonly userId: string

    /**
     * 
     * @type {string}
     * @memberof PassportApiGetLinkedAddresses
     */
    readonly chainName: string
}

/**
 * Request parameters for getLinkedAddressesDeprecated operation in PassportApi.
 * @export
 * @interface PassportApiGetLinkedAddressesDeprecatedRequest
 */
export interface PassportApiGetLinkedAddressesDeprecatedRequest {
    /**
     * The user\&#39;s userId
     * @type {string}
     * @memberof PassportApiGetLinkedAddressesDeprecated
     */
    readonly userId: string
}

/**
 * Request parameters for getTransactionMetadata operation in PassportApi.
 * @export
 * @interface PassportApiGetTransactionMetadataRequest
 */
export interface PassportApiGetTransactionMetadataRequest {
    /**
     * 
     * @type {string}
     * @memberof PassportApiGetTransactionMetadata
     */
    readonly chainName: string

    /**
     * 
     * @type {GetTransactionMetadataRequest}
     * @memberof PassportApiGetTransactionMetadata
     */
    readonly getTransactionMetadataRequest: GetTransactionMetadataRequest
}

/**
 * Request parameters for getTypedDataMetadata operation in PassportApi.
 * @export
 * @interface PassportApiGetTypedDataMetadataRequest
 */
export interface PassportApiGetTypedDataMetadataRequest {
    /**
     * 
     * @type {string}
     * @memberof PassportApiGetTypedDataMetadata
     */
    readonly chainName: string

    /**
     * 
     * @type {GetTypedDataMetadataRequest}
     * @memberof PassportApiGetTypedDataMetadata
     */
    readonly getTypedDataMetadataRequest: GetTypedDataMetadataRequest
}

/**
 * PassportApi - object-oriented interface
 * @export
 * @class PassportApi
 * @extends {BaseAPI}
 */
export class PassportApi extends BaseAPI {
    /**
     * Create a counterfactual address for a user based on their Ethereum address
     * @summary Create a counterfactual address v2
     * @param {PassportApiCreateCounterfactualAddressV2Request} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PassportApi
     */
    public createCounterfactualAddressV2(requestParameters: PassportApiCreateCounterfactualAddressV2Request, options?: AxiosRequestConfig) {
        return PassportApiFp(this.configuration).createCounterfactualAddressV2(requestParameters.chainName, requestParameters.createCounterfactualAddressRequest, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * This API has been deprecated, please use https://docs.immutable.com/zkevm/api/reference/#/operations/getUserInfo instead to get a list of linked addresses.
     * @summary Get Ethereum linked addresses for a user
     * @param {PassportApiGetLinkedAddressesRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @deprecated
     * @throws {RequiredError}
     * @memberof PassportApi
     */
    public getLinkedAddresses(requestParameters: PassportApiGetLinkedAddressesRequest, options?: AxiosRequestConfig) {
        return PassportApiFp(this.configuration).getLinkedAddresses(requestParameters.userId, requestParameters.chainName, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Get all the Ethereum linked addresses for a user based on its userId
     * @summary Deprecated Get Ethereum linked addresses for a user
     * @param {PassportApiGetLinkedAddressesDeprecatedRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @deprecated
     * @throws {RequiredError}
     * @memberof PassportApi
     */
    public getLinkedAddressesDeprecated(requestParameters: PassportApiGetLinkedAddressesDeprecatedRequest, options?: AxiosRequestConfig) {
        return PassportApiFp(this.configuration).getLinkedAddressesDeprecated(requestParameters.userId, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Get transaction metadata for a given encoded transaction
     * @summary Get transaction metadata
     * @param {PassportApiGetTransactionMetadataRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PassportApi
     */
    public getTransactionMetadata(requestParameters: PassportApiGetTransactionMetadataRequest, options?: AxiosRequestConfig) {
        return PassportApiFp(this.configuration).getTransactionMetadata(requestParameters.chainName, requestParameters.getTransactionMetadataRequest, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Get typeddata metadata for a given encoded typeddata
     * @summary Get typeddata metadata
     * @param {PassportApiGetTypedDataMetadataRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PassportApi
     */
    public getTypedDataMetadata(requestParameters: PassportApiGetTypedDataMetadataRequest, options?: AxiosRequestConfig) {
        return PassportApiFp(this.configuration).getTypedDataMetadata(requestParameters.chainName, requestParameters.getTypedDataMetadataRequest, options).then((request) => request(this.axios, this.basePath));
    }
}

