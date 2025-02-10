/* tslint:disable */
/* eslint-disable */
/**
 * Immutable X API
 * Immutable X API
 *
 * The version of the OpenAPI document: 3.0
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
import { Deposit } from '../models';
// @ts-ignore
import { GetSignableDepositRequest } from '../models';
// @ts-ignore
import { GetSignableDepositResponse } from '../models';
// @ts-ignore
import { ListDepositsResponse } from '../models';
/**
 * DepositsApi - axios parameter creator
 * @export
 */
export const DepositsApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Get details of a deposit with the given ID
         * @summary Get details of a deposit with the given ID
         * @param {string} id Deposit ID
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getDeposit: async (id: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'id' is not null or undefined
            assertParamExists('getDeposit', 'id', id)
            const localVarPath = `/v1/deposits/{id}`
                .replace(`{${"id"}}`, encodeURIComponent(String(id)));
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
         * Gets details of a signable deposit
         * @summary Gets details of a signable deposit
         * @param {GetSignableDepositRequest} getSignableDepositRequest Get details of signable deposit
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getSignableDeposit: async (getSignableDepositRequest: GetSignableDepositRequest, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'getSignableDepositRequest' is not null or undefined
            assertParamExists('getSignableDeposit', 'getSignableDepositRequest', getSignableDepositRequest)
            const localVarPath = `/v1/signable-deposit-details`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(getSignableDepositRequest, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Get a list of deposits
         * @summary Get a list of deposits
         * @param {number} [pageSize] Page size of the result
         * @param {string} [cursor] Cursor
         * @param {string} [orderBy] Property to sort by
         * @param {string} [direction] Direction to sort (asc/desc)
         * @param {string} [user] Ethereum address of the user who submitted this deposit
         * @param {'success' | 'failure'} [status] Status of this deposit
         * @param {string} [minTimestamp] Minimum timestamp for this deposit, in ISO 8601 UTC format. Example: \&#39;2022-05-27T00:10:22Z\&#39;
         * @param {string} [maxTimestamp] Maximum timestamp for this deposit, in ISO 8601 UTC format. Example: \&#39;2022-05-27T00:10:22Z\&#39;
         * @param {'erc721' | 'erc20' | 'eth'} [tokenType] Token type of the deposited asset
         * @param {string} [tokenId] ERC721 Token ID of the minted asset
         * @param {string} [assetId] Internal IMX ID of the minted asset
         * @param {string} [tokenAddress] Token address of the deposited asset
         * @param {string} [tokenName] Token name of the deposited asset
         * @param {string} [minQuantity] Min quantity for the deposited asset
         * @param {string} [maxQuantity] Max quantity for the deposited asset
         * @param {string} [metadata] JSON-encoded metadata filters for the deposited asset
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listDeposits: async (pageSize?: number, cursor?: string, orderBy?: string, direction?: string, user?: string, status?: 'success' | 'failure', minTimestamp?: string, maxTimestamp?: string, tokenType?: 'erc721' | 'erc20' | 'eth', tokenId?: string, assetId?: string, tokenAddress?: string, tokenName?: string, minQuantity?: string, maxQuantity?: string, metadata?: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/v1/deposits`;
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

            if (orderBy !== undefined) {
                localVarQueryParameter['order_by'] = orderBy;
            }

            if (direction !== undefined) {
                localVarQueryParameter['direction'] = direction;
            }

            if (user !== undefined) {
                localVarQueryParameter['user'] = user;
            }

            if (status !== undefined) {
                localVarQueryParameter['status'] = status;
            }

            if (minTimestamp !== undefined) {
                localVarQueryParameter['min_timestamp'] = minTimestamp;
            }

            if (maxTimestamp !== undefined) {
                localVarQueryParameter['max_timestamp'] = maxTimestamp;
            }

            if (tokenType !== undefined) {
                localVarQueryParameter['token_type'] = tokenType;
            }

            if (tokenId !== undefined) {
                localVarQueryParameter['token_id'] = tokenId;
            }

            if (assetId !== undefined) {
                localVarQueryParameter['asset_id'] = assetId;
            }

            if (tokenAddress !== undefined) {
                localVarQueryParameter['token_address'] = tokenAddress;
            }

            if (tokenName !== undefined) {
                localVarQueryParameter['token_name'] = tokenName;
            }

            if (minQuantity !== undefined) {
                localVarQueryParameter['min_quantity'] = minQuantity;
            }

            if (maxQuantity !== undefined) {
                localVarQueryParameter['max_quantity'] = maxQuantity;
            }

            if (metadata !== undefined) {
                localVarQueryParameter['metadata'] = metadata;
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
 * DepositsApi - functional programming interface
 * @export
 */
export const DepositsApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = DepositsApiAxiosParamCreator(configuration)
    return {
        /**
         * Get details of a deposit with the given ID
         * @summary Get details of a deposit with the given ID
         * @param {string} id Deposit ID
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getDeposit(id: string, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Deposit>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getDeposit(id, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Gets details of a signable deposit
         * @summary Gets details of a signable deposit
         * @param {GetSignableDepositRequest} getSignableDepositRequest Get details of signable deposit
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getSignableDeposit(getSignableDepositRequest: GetSignableDepositRequest, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<GetSignableDepositResponse>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getSignableDeposit(getSignableDepositRequest, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Get a list of deposits
         * @summary Get a list of deposits
         * @param {number} [pageSize] Page size of the result
         * @param {string} [cursor] Cursor
         * @param {string} [orderBy] Property to sort by
         * @param {string} [direction] Direction to sort (asc/desc)
         * @param {string} [user] Ethereum address of the user who submitted this deposit
         * @param {'success' | 'failure'} [status] Status of this deposit
         * @param {string} [minTimestamp] Minimum timestamp for this deposit, in ISO 8601 UTC format. Example: \&#39;2022-05-27T00:10:22Z\&#39;
         * @param {string} [maxTimestamp] Maximum timestamp for this deposit, in ISO 8601 UTC format. Example: \&#39;2022-05-27T00:10:22Z\&#39;
         * @param {'erc721' | 'erc20' | 'eth'} [tokenType] Token type of the deposited asset
         * @param {string} [tokenId] ERC721 Token ID of the minted asset
         * @param {string} [assetId] Internal IMX ID of the minted asset
         * @param {string} [tokenAddress] Token address of the deposited asset
         * @param {string} [tokenName] Token name of the deposited asset
         * @param {string} [minQuantity] Min quantity for the deposited asset
         * @param {string} [maxQuantity] Max quantity for the deposited asset
         * @param {string} [metadata] JSON-encoded metadata filters for the deposited asset
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async listDeposits(pageSize?: number, cursor?: string, orderBy?: string, direction?: string, user?: string, status?: 'success' | 'failure', minTimestamp?: string, maxTimestamp?: string, tokenType?: 'erc721' | 'erc20' | 'eth', tokenId?: string, assetId?: string, tokenAddress?: string, tokenName?: string, minQuantity?: string, maxQuantity?: string, metadata?: string, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<ListDepositsResponse>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.listDeposits(pageSize, cursor, orderBy, direction, user, status, minTimestamp, maxTimestamp, tokenType, tokenId, assetId, tokenAddress, tokenName, minQuantity, maxQuantity, metadata, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * DepositsApi - factory interface
 * @export
 */
export const DepositsApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = DepositsApiFp(configuration)
    return {
        /**
         * Get details of a deposit with the given ID
         * @summary Get details of a deposit with the given ID
         * @param {string} id Deposit ID
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getDeposit(id: string, options?: any): AxiosPromise<Deposit> {
            return localVarFp.getDeposit(id, options).then((request) => request(axios, basePath));
        },
        /**
         * Gets details of a signable deposit
         * @summary Gets details of a signable deposit
         * @param {GetSignableDepositRequest} getSignableDepositRequest Get details of signable deposit
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getSignableDeposit(getSignableDepositRequest: GetSignableDepositRequest, options?: any): AxiosPromise<GetSignableDepositResponse> {
            return localVarFp.getSignableDeposit(getSignableDepositRequest, options).then((request) => request(axios, basePath));
        },
        /**
         * Get a list of deposits
         * @summary Get a list of deposits
         * @param {number} [pageSize] Page size of the result
         * @param {string} [cursor] Cursor
         * @param {string} [orderBy] Property to sort by
         * @param {string} [direction] Direction to sort (asc/desc)
         * @param {string} [user] Ethereum address of the user who submitted this deposit
         * @param {'success' | 'failure'} [status] Status of this deposit
         * @param {string} [minTimestamp] Minimum timestamp for this deposit, in ISO 8601 UTC format. Example: \&#39;2022-05-27T00:10:22Z\&#39;
         * @param {string} [maxTimestamp] Maximum timestamp for this deposit, in ISO 8601 UTC format. Example: \&#39;2022-05-27T00:10:22Z\&#39;
         * @param {'erc721' | 'erc20' | 'eth'} [tokenType] Token type of the deposited asset
         * @param {string} [tokenId] ERC721 Token ID of the minted asset
         * @param {string} [assetId] Internal IMX ID of the minted asset
         * @param {string} [tokenAddress] Token address of the deposited asset
         * @param {string} [tokenName] Token name of the deposited asset
         * @param {string} [minQuantity] Min quantity for the deposited asset
         * @param {string} [maxQuantity] Max quantity for the deposited asset
         * @param {string} [metadata] JSON-encoded metadata filters for the deposited asset
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listDeposits(pageSize?: number, cursor?: string, orderBy?: string, direction?: string, user?: string, status?: 'success' | 'failure', minTimestamp?: string, maxTimestamp?: string, tokenType?: 'erc721' | 'erc20' | 'eth', tokenId?: string, assetId?: string, tokenAddress?: string, tokenName?: string, minQuantity?: string, maxQuantity?: string, metadata?: string, options?: any): AxiosPromise<ListDepositsResponse> {
            return localVarFp.listDeposits(pageSize, cursor, orderBy, direction, user, status, minTimestamp, maxTimestamp, tokenType, tokenId, assetId, tokenAddress, tokenName, minQuantity, maxQuantity, metadata, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * Request parameters for getDeposit operation in DepositsApi.
 * @export
 * @interface DepositsApiGetDepositRequest
 */
export interface DepositsApiGetDepositRequest {
    /**
     * Deposit ID
     * @type {string}
     * @memberof DepositsApiGetDeposit
     */
    readonly id: string
}

/**
 * Request parameters for getSignableDeposit operation in DepositsApi.
 * @export
 * @interface DepositsApiGetSignableDepositRequest
 */
export interface DepositsApiGetSignableDepositRequest {
    /**
     * Get details of signable deposit
     * @type {GetSignableDepositRequest}
     * @memberof DepositsApiGetSignableDeposit
     */
    readonly getSignableDepositRequest: GetSignableDepositRequest
}

/**
 * Request parameters for listDeposits operation in DepositsApi.
 * @export
 * @interface DepositsApiListDepositsRequest
 */
export interface DepositsApiListDepositsRequest {
    /**
     * Page size of the result
     * @type {number}
     * @memberof DepositsApiListDeposits
     */
    readonly pageSize?: number

    /**
     * Cursor
     * @type {string}
     * @memberof DepositsApiListDeposits
     */
    readonly cursor?: string

    /**
     * Property to sort by
     * @type {string}
     * @memberof DepositsApiListDeposits
     */
    readonly orderBy?: string

    /**
     * Direction to sort (asc/desc)
     * @type {string}
     * @memberof DepositsApiListDeposits
     */
    readonly direction?: string

    /**
     * Ethereum address of the user who submitted this deposit
     * @type {string}
     * @memberof DepositsApiListDeposits
     */
    readonly user?: string

    /**
     * Status of this deposit
     * @type {'success' | 'failure'}
     * @memberof DepositsApiListDeposits
     */
    readonly status?: 'success' | 'failure'

    /**
     * Minimum timestamp for this deposit, in ISO 8601 UTC format. Example: \&#39;2022-05-27T00:10:22Z\&#39;
     * @type {string}
     * @memberof DepositsApiListDeposits
     */
    readonly minTimestamp?: string

    /**
     * Maximum timestamp for this deposit, in ISO 8601 UTC format. Example: \&#39;2022-05-27T00:10:22Z\&#39;
     * @type {string}
     * @memberof DepositsApiListDeposits
     */
    readonly maxTimestamp?: string

    /**
     * Token type of the deposited asset
     * @type {'erc721' | 'erc20' | 'eth'}
     * @memberof DepositsApiListDeposits
     */
    readonly tokenType?: 'erc721' | 'erc20' | 'eth'

    /**
     * ERC721 Token ID of the minted asset
     * @type {string}
     * @memberof DepositsApiListDeposits
     */
    readonly tokenId?: string

    /**
     * Internal IMX ID of the minted asset
     * @type {string}
     * @memberof DepositsApiListDeposits
     */
    readonly assetId?: string

    /**
     * Token address of the deposited asset
     * @type {string}
     * @memberof DepositsApiListDeposits
     */
    readonly tokenAddress?: string

    /**
     * Token name of the deposited asset
     * @type {string}
     * @memberof DepositsApiListDeposits
     */
    readonly tokenName?: string

    /**
     * Min quantity for the deposited asset
     * @type {string}
     * @memberof DepositsApiListDeposits
     */
    readonly minQuantity?: string

    /**
     * Max quantity for the deposited asset
     * @type {string}
     * @memberof DepositsApiListDeposits
     */
    readonly maxQuantity?: string

    /**
     * JSON-encoded metadata filters for the deposited asset
     * @type {string}
     * @memberof DepositsApiListDeposits
     */
    readonly metadata?: string
}

/**
 * DepositsApi - object-oriented interface
 * @export
 * @class DepositsApi
 * @extends {BaseAPI}
 */
export class DepositsApi extends BaseAPI {
    /**
     * Get details of a deposit with the given ID
     * @summary Get details of a deposit with the given ID
     * @param {DepositsApiGetDepositRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DepositsApi
     */
    public getDeposit(requestParameters: DepositsApiGetDepositRequest, options?: AxiosRequestConfig) {
        return DepositsApiFp(this.configuration).getDeposit(requestParameters.id, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Gets details of a signable deposit
     * @summary Gets details of a signable deposit
     * @param {DepositsApiGetSignableDepositRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DepositsApi
     */
    public getSignableDeposit(requestParameters: DepositsApiGetSignableDepositRequest, options?: AxiosRequestConfig) {
        return DepositsApiFp(this.configuration).getSignableDeposit(requestParameters.getSignableDepositRequest, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Get a list of deposits
     * @summary Get a list of deposits
     * @param {DepositsApiListDepositsRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DepositsApi
     */
    public listDeposits(requestParameters: DepositsApiListDepositsRequest = {}, options?: AxiosRequestConfig) {
        return DepositsApiFp(this.configuration).listDeposits(requestParameters.pageSize, requestParameters.cursor, requestParameters.orderBy, requestParameters.direction, requestParameters.user, requestParameters.status, requestParameters.minTimestamp, requestParameters.maxTimestamp, requestParameters.tokenType, requestParameters.tokenId, requestParameters.assetId, requestParameters.tokenAddress, requestParameters.tokenName, requestParameters.minQuantity, requestParameters.maxQuantity, requestParameters.metadata, options).then((request) => request(this.axios, this.basePath));
    }
}
