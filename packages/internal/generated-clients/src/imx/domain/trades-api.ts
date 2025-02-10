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
import { APIError } from '../models';
// @ts-ignore
import { CreateTradeResponse } from '../models';
// @ts-ignore
import { GetSignableTradeRequest } from '../models';
// @ts-ignore
import { GetSignableTradeResponse } from '../models';
// @ts-ignore
import { ListTradesResponse } from '../models';
// @ts-ignore
import { Trade } from '../models';
// @ts-ignore
import { TradesCreateTradeRequest } from '../models';
/**
 * TradesApi - axios parameter creator
 * @export
 */
export const TradesApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Create a Trade.
         * @summary Create a Trade (V3)
         * @param {TradesCreateTradeRequest} createTradeRequest create a trade
         * @param {string} [xImxEthAddress] eth address
         * @param {string} [xImxEthSignature] eth signature
         * @param {string} [authorization] Authorization header
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createTradeV3: async (createTradeRequest: TradesCreateTradeRequest, xImxEthAddress?: string, xImxEthSignature?: string, authorization?: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'createTradeRequest' is not null or undefined
            assertParamExists('createTradeV3', 'createTradeRequest', createTradeRequest)
            const localVarPath = `/v3/trades`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            if (xImxEthAddress != null) {
                localVarHeaderParameter['x-imx-eth-address'] = String(xImxEthAddress);
            }

            if (xImxEthSignature != null) {
                localVarHeaderParameter['x-imx-eth-signature'] = String(xImxEthSignature);
            }

            if (authorization != null) {
                localVarHeaderParameter['Authorization'] = String(authorization);
            }


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(createTradeRequest, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Generate a signable trade message (V3)
         * @summary Generate a signable trade message (V3)
         * @param {GetSignableTradeRequest} getSignableTradeRequest get a signable trade
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getSignableTrade: async (getSignableTradeRequest: GetSignableTradeRequest, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'getSignableTradeRequest' is not null or undefined
            assertParamExists('getSignableTrade', 'getSignableTradeRequest', getSignableTradeRequest)
            const localVarPath = `/v3/signable-trade-details`;
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
            localVarRequestOptions.data = serializeDataIfNeeded(getSignableTradeRequest, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Get details of a trade with the given ID
         * @summary Get details of a trade with the given ID
         * @param {string} id Trade ID
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getTradeV3: async (id: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'id' is not null or undefined
            assertParamExists('getTradeV3', 'id', id)
            const localVarPath = `/v3/trades/{id}`
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
         * Get a list of trades (V3)
         * @summary Get a list of trades (V3)
         * @param {string} [partyATokenType] Party A\&#39;s (buy order) token type of currency used to buy
         * @param {string} [partyATokenAddress] Party A\&#39;s (buy order) token address of currency used to buy
         * @param {string} [partyBTokenType] Party B\&#39;s (sell order) token type of NFT sold - always ERC721
         * @param {string} [partyBTokenAddress] Party B\&#39;s (sell order) collection address of NFT sold
         * @param {string} [partyBTokenId] Party B\&#39;s (sell order) token id of NFT sold
         * @param {number} [pageSize] Page size of the result
         * @param {string} [cursor] Cursor
         * @param {'created_at' | 'transaction_id' | 'party_a_sold_quantity' | 'party_b_sold_quantity' | 'timestamp' | 'updated_timestamp'} [orderBy] Property to sort by
         * @param {string} [direction] Direction to sort (asc/desc)
         * @param {string} [minTimestamp] Minimum timestamp for this trade, in ISO 8601 UTC format. Example: \&#39;2022-06-27T00:10:22Z\&#39;
         * @param {string} [maxTimestamp] Maximum timestamp for this trade, in ISO 8601 UTC format. Example: \&#39;2022-06-27T00:10:22Z\&#39;
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listTradesV3: async (partyATokenType?: string, partyATokenAddress?: string, partyBTokenType?: string, partyBTokenAddress?: string, partyBTokenId?: string, pageSize?: number, cursor?: string, orderBy?: 'created_at' | 'transaction_id' | 'party_a_sold_quantity' | 'party_b_sold_quantity' | 'timestamp' | 'updated_timestamp', direction?: string, minTimestamp?: string, maxTimestamp?: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/v3/trades`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            if (partyATokenType !== undefined) {
                localVarQueryParameter['party_a_token_type'] = partyATokenType;
            }

            if (partyATokenAddress !== undefined) {
                localVarQueryParameter['party_a_token_address'] = partyATokenAddress;
            }

            if (partyBTokenType !== undefined) {
                localVarQueryParameter['party_b_token_type'] = partyBTokenType;
            }

            if (partyBTokenAddress !== undefined) {
                localVarQueryParameter['party_b_token_address'] = partyBTokenAddress;
            }

            if (partyBTokenId !== undefined) {
                localVarQueryParameter['party_b_token_id'] = partyBTokenId;
            }

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

            if (minTimestamp !== undefined) {
                localVarQueryParameter['min_timestamp'] = minTimestamp;
            }

            if (maxTimestamp !== undefined) {
                localVarQueryParameter['max_timestamp'] = maxTimestamp;
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
 * TradesApi - functional programming interface
 * @export
 */
export const TradesApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = TradesApiAxiosParamCreator(configuration)
    return {
        /**
         * Create a Trade.
         * @summary Create a Trade (V3)
         * @param {TradesCreateTradeRequest} createTradeRequest create a trade
         * @param {string} [xImxEthAddress] eth address
         * @param {string} [xImxEthSignature] eth signature
         * @param {string} [authorization] Authorization header
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async createTradeV3(createTradeRequest: TradesCreateTradeRequest, xImxEthAddress?: string, xImxEthSignature?: string, authorization?: string, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<CreateTradeResponse>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.createTradeV3(createTradeRequest, xImxEthAddress, xImxEthSignature, authorization, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Generate a signable trade message (V3)
         * @summary Generate a signable trade message (V3)
         * @param {GetSignableTradeRequest} getSignableTradeRequest get a signable trade
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getSignableTrade(getSignableTradeRequest: GetSignableTradeRequest, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<GetSignableTradeResponse>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getSignableTrade(getSignableTradeRequest, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Get details of a trade with the given ID
         * @summary Get details of a trade with the given ID
         * @param {string} id Trade ID
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getTradeV3(id: string, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Trade>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getTradeV3(id, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Get a list of trades (V3)
         * @summary Get a list of trades (V3)
         * @param {string} [partyATokenType] Party A\&#39;s (buy order) token type of currency used to buy
         * @param {string} [partyATokenAddress] Party A\&#39;s (buy order) token address of currency used to buy
         * @param {string} [partyBTokenType] Party B\&#39;s (sell order) token type of NFT sold - always ERC721
         * @param {string} [partyBTokenAddress] Party B\&#39;s (sell order) collection address of NFT sold
         * @param {string} [partyBTokenId] Party B\&#39;s (sell order) token id of NFT sold
         * @param {number} [pageSize] Page size of the result
         * @param {string} [cursor] Cursor
         * @param {'created_at' | 'transaction_id' | 'party_a_sold_quantity' | 'party_b_sold_quantity' | 'timestamp' | 'updated_timestamp'} [orderBy] Property to sort by
         * @param {string} [direction] Direction to sort (asc/desc)
         * @param {string} [minTimestamp] Minimum timestamp for this trade, in ISO 8601 UTC format. Example: \&#39;2022-06-27T00:10:22Z\&#39;
         * @param {string} [maxTimestamp] Maximum timestamp for this trade, in ISO 8601 UTC format. Example: \&#39;2022-06-27T00:10:22Z\&#39;
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async listTradesV3(partyATokenType?: string, partyATokenAddress?: string, partyBTokenType?: string, partyBTokenAddress?: string, partyBTokenId?: string, pageSize?: number, cursor?: string, orderBy?: 'created_at' | 'transaction_id' | 'party_a_sold_quantity' | 'party_b_sold_quantity' | 'timestamp' | 'updated_timestamp', direction?: string, minTimestamp?: string, maxTimestamp?: string, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<ListTradesResponse>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.listTradesV3(partyATokenType, partyATokenAddress, partyBTokenType, partyBTokenAddress, partyBTokenId, pageSize, cursor, orderBy, direction, minTimestamp, maxTimestamp, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * TradesApi - factory interface
 * @export
 */
export const TradesApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = TradesApiFp(configuration)
    return {
        /**
         * Create a Trade.
         * @summary Create a Trade (V3)
         * @param {TradesCreateTradeRequest} createTradeRequest create a trade
         * @param {string} [xImxEthAddress] eth address
         * @param {string} [xImxEthSignature] eth signature
         * @param {string} [authorization] Authorization header
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createTradeV3(createTradeRequest: TradesCreateTradeRequest, xImxEthAddress?: string, xImxEthSignature?: string, authorization?: string, options?: any): AxiosPromise<CreateTradeResponse> {
            return localVarFp.createTradeV3(createTradeRequest, xImxEthAddress, xImxEthSignature, authorization, options).then((request) => request(axios, basePath));
        },
        /**
         * Generate a signable trade message (V3)
         * @summary Generate a signable trade message (V3)
         * @param {GetSignableTradeRequest} getSignableTradeRequest get a signable trade
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getSignableTrade(getSignableTradeRequest: GetSignableTradeRequest, options?: any): AxiosPromise<GetSignableTradeResponse> {
            return localVarFp.getSignableTrade(getSignableTradeRequest, options).then((request) => request(axios, basePath));
        },
        /**
         * Get details of a trade with the given ID
         * @summary Get details of a trade with the given ID
         * @param {string} id Trade ID
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getTradeV3(id: string, options?: any): AxiosPromise<Trade> {
            return localVarFp.getTradeV3(id, options).then((request) => request(axios, basePath));
        },
        /**
         * Get a list of trades (V3)
         * @summary Get a list of trades (V3)
         * @param {string} [partyATokenType] Party A\&#39;s (buy order) token type of currency used to buy
         * @param {string} [partyATokenAddress] Party A\&#39;s (buy order) token address of currency used to buy
         * @param {string} [partyBTokenType] Party B\&#39;s (sell order) token type of NFT sold - always ERC721
         * @param {string} [partyBTokenAddress] Party B\&#39;s (sell order) collection address of NFT sold
         * @param {string} [partyBTokenId] Party B\&#39;s (sell order) token id of NFT sold
         * @param {number} [pageSize] Page size of the result
         * @param {string} [cursor] Cursor
         * @param {'created_at' | 'transaction_id' | 'party_a_sold_quantity' | 'party_b_sold_quantity' | 'timestamp' | 'updated_timestamp'} [orderBy] Property to sort by
         * @param {string} [direction] Direction to sort (asc/desc)
         * @param {string} [minTimestamp] Minimum timestamp for this trade, in ISO 8601 UTC format. Example: \&#39;2022-06-27T00:10:22Z\&#39;
         * @param {string} [maxTimestamp] Maximum timestamp for this trade, in ISO 8601 UTC format. Example: \&#39;2022-06-27T00:10:22Z\&#39;
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listTradesV3(partyATokenType?: string, partyATokenAddress?: string, partyBTokenType?: string, partyBTokenAddress?: string, partyBTokenId?: string, pageSize?: number, cursor?: string, orderBy?: 'created_at' | 'transaction_id' | 'party_a_sold_quantity' | 'party_b_sold_quantity' | 'timestamp' | 'updated_timestamp', direction?: string, minTimestamp?: string, maxTimestamp?: string, options?: any): AxiosPromise<ListTradesResponse> {
            return localVarFp.listTradesV3(partyATokenType, partyATokenAddress, partyBTokenType, partyBTokenAddress, partyBTokenId, pageSize, cursor, orderBy, direction, minTimestamp, maxTimestamp, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * Request parameters for createTradeV3 operation in TradesApi.
 * @export
 * @interface TradesApiCreateTradeV3Request
 */
export interface TradesApiCreateTradeV3Request {
    /**
     * create a trade
     * @type {TradesCreateTradeRequest}
     * @memberof TradesApiCreateTradeV3
     */
    readonly createTradeRequest: TradesCreateTradeRequest

    /**
     * eth address
     * @type {string}
     * @memberof TradesApiCreateTradeV3
     */
    readonly xImxEthAddress?: string

    /**
     * eth signature
     * @type {string}
     * @memberof TradesApiCreateTradeV3
     */
    readonly xImxEthSignature?: string

    /**
     * Authorization header
     * @type {string}
     * @memberof TradesApiCreateTradeV3
     */
    readonly authorization?: string
}

/**
 * Request parameters for getSignableTrade operation in TradesApi.
 * @export
 * @interface TradesApiGetSignableTradeRequest
 */
export interface TradesApiGetSignableTradeRequest {
    /**
     * get a signable trade
     * @type {GetSignableTradeRequest}
     * @memberof TradesApiGetSignableTrade
     */
    readonly getSignableTradeRequest: GetSignableTradeRequest
}

/**
 * Request parameters for getTradeV3 operation in TradesApi.
 * @export
 * @interface TradesApiGetTradeV3Request
 */
export interface TradesApiGetTradeV3Request {
    /**
     * Trade ID
     * @type {string}
     * @memberof TradesApiGetTradeV3
     */
    readonly id: string
}

/**
 * Request parameters for listTradesV3 operation in TradesApi.
 * @export
 * @interface TradesApiListTradesV3Request
 */
export interface TradesApiListTradesV3Request {
    /**
     * Party A\&#39;s (buy order) token type of currency used to buy
     * @type {string}
     * @memberof TradesApiListTradesV3
     */
    readonly partyATokenType?: string

    /**
     * Party A\&#39;s (buy order) token address of currency used to buy
     * @type {string}
     * @memberof TradesApiListTradesV3
     */
    readonly partyATokenAddress?: string

    /**
     * Party B\&#39;s (sell order) token type of NFT sold - always ERC721
     * @type {string}
     * @memberof TradesApiListTradesV3
     */
    readonly partyBTokenType?: string

    /**
     * Party B\&#39;s (sell order) collection address of NFT sold
     * @type {string}
     * @memberof TradesApiListTradesV3
     */
    readonly partyBTokenAddress?: string

    /**
     * Party B\&#39;s (sell order) token id of NFT sold
     * @type {string}
     * @memberof TradesApiListTradesV3
     */
    readonly partyBTokenId?: string

    /**
     * Page size of the result
     * @type {number}
     * @memberof TradesApiListTradesV3
     */
    readonly pageSize?: number

    /**
     * Cursor
     * @type {string}
     * @memberof TradesApiListTradesV3
     */
    readonly cursor?: string

    /**
     * Property to sort by
     * @type {'created_at' | 'transaction_id' | 'party_a_sold_quantity' | 'party_b_sold_quantity' | 'timestamp' | 'updated_timestamp'}
     * @memberof TradesApiListTradesV3
     */
    readonly orderBy?: 'created_at' | 'transaction_id' | 'party_a_sold_quantity' | 'party_b_sold_quantity' | 'timestamp' | 'updated_timestamp'

    /**
     * Direction to sort (asc/desc)
     * @type {string}
     * @memberof TradesApiListTradesV3
     */
    readonly direction?: string

    /**
     * Minimum timestamp for this trade, in ISO 8601 UTC format. Example: \&#39;2022-06-27T00:10:22Z\&#39;
     * @type {string}
     * @memberof TradesApiListTradesV3
     */
    readonly minTimestamp?: string

    /**
     * Maximum timestamp for this trade, in ISO 8601 UTC format. Example: \&#39;2022-06-27T00:10:22Z\&#39;
     * @type {string}
     * @memberof TradesApiListTradesV3
     */
    readonly maxTimestamp?: string
}

/**
 * TradesApi - object-oriented interface
 * @export
 * @class TradesApi
 * @extends {BaseAPI}
 */
export class TradesApi extends BaseAPI {
    /**
     * Create a Trade.
     * @summary Create a Trade (V3)
     * @param {TradesApiCreateTradeV3Request} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TradesApi
     */
    public createTradeV3(requestParameters: TradesApiCreateTradeV3Request, options?: AxiosRequestConfig) {
        return TradesApiFp(this.configuration).createTradeV3(requestParameters.createTradeRequest, requestParameters.xImxEthAddress, requestParameters.xImxEthSignature, requestParameters.authorization, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Generate a signable trade message (V3)
     * @summary Generate a signable trade message (V3)
     * @param {TradesApiGetSignableTradeRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TradesApi
     */
    public getSignableTrade(requestParameters: TradesApiGetSignableTradeRequest, options?: AxiosRequestConfig) {
        return TradesApiFp(this.configuration).getSignableTrade(requestParameters.getSignableTradeRequest, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Get details of a trade with the given ID
     * @summary Get details of a trade with the given ID
     * @param {TradesApiGetTradeV3Request} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TradesApi
     */
    public getTradeV3(requestParameters: TradesApiGetTradeV3Request, options?: AxiosRequestConfig) {
        return TradesApiFp(this.configuration).getTradeV3(requestParameters.id, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Get a list of trades (V3)
     * @summary Get a list of trades (V3)
     * @param {TradesApiListTradesV3Request} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TradesApi
     */
    public listTradesV3(requestParameters: TradesApiListTradesV3Request = {}, options?: AxiosRequestConfig) {
        return TradesApiFp(this.configuration).listTradesV3(requestParameters.partyATokenType, requestParameters.partyATokenAddress, requestParameters.partyBTokenType, requestParameters.partyBTokenAddress, requestParameters.partyBTokenId, requestParameters.pageSize, requestParameters.cursor, requestParameters.orderBy, requestParameters.direction, requestParameters.minTimestamp, requestParameters.maxTimestamp, options).then((request) => request(this.axios, this.basePath));
    }
}
