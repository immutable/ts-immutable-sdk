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
import { APIError404 } from '../models';
// @ts-ignore
import { APIError500 } from '../models';
// @ts-ignore
import { GetNFTResult } from '../models';
// @ts-ignore
import { ListNFTOwnersResult } from '../models';
// @ts-ignore
import { ListNFTsResult } from '../models';
/**
 * NftsApi - axios parameter creator
 * @export
 */
export const NftsApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Get NFT by token ID
         * @summary Get NFT by token ID
         * @param {string} contractAddress The address of NFT contract
         * @param {string} tokenId An &#x60;uint256&#x60; token id as string
         * @param {string} chainName The name of chain
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getNFT: async (contractAddress: string, tokenId: string, chainName: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'contractAddress' is not null or undefined
            assertParamExists('getNFT', 'contractAddress', contractAddress)
            // verify required parameter 'tokenId' is not null or undefined
            assertParamExists('getNFT', 'tokenId', tokenId)
            // verify required parameter 'chainName' is not null or undefined
            assertParamExists('getNFT', 'chainName', chainName)
            const localVarPath = `/v1/chains/{chain_name}/collections/{contract_address}/nfts/{token_id}`
                .replace(`{${"contract_address"}}`, encodeURIComponent(String(contractAddress)))
                .replace(`{${"token_id"}}`, encodeURIComponent(String(tokenId)))
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
         * List all NFT owners on a chain
         * @summary List all NFT owners
         * @param {string} chainName The name of chain
         * @param {string} fromUpdatedAt Datetime to use as the oldest updated timestamp
         * @param {string} [pageCursor] Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
         * @param {number} [pageSize] Maximum number of items to return
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listAllNFTOwners: async (chainName: string, fromUpdatedAt: string, pageCursor?: string, pageSize?: number, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'chainName' is not null or undefined
            assertParamExists('listAllNFTOwners', 'chainName', chainName)
            // verify required parameter 'fromUpdatedAt' is not null or undefined
            assertParamExists('listAllNFTOwners', 'fromUpdatedAt', fromUpdatedAt)
            const localVarPath = `/v1/chains/{chain_name}/nft-owners`
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

            if (fromUpdatedAt !== undefined) {
                localVarQueryParameter['from_updated_at'] = (fromUpdatedAt as any instanceof Date) ?
                    (fromUpdatedAt as any).toISOString() :
                    fromUpdatedAt;
            }

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
        /**
         * List all NFTs on a chain
         * @summary List all NFTs
         * @param {string} chainName The name of chain
         * @param {string} [fromUpdatedAt] Datetime to use as the oldest updated timestamp
         * @param {string} [pageCursor] Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
         * @param {number} [pageSize] Maximum number of items to return
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listAllNFTs: async (chainName: string, fromUpdatedAt?: string, pageCursor?: string, pageSize?: number, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'chainName' is not null or undefined
            assertParamExists('listAllNFTs', 'chainName', chainName)
            const localVarPath = `/v1/chains/{chain_name}/nfts`
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

            if (fromUpdatedAt !== undefined) {
                localVarQueryParameter['from_updated_at'] = (fromUpdatedAt as any instanceof Date) ?
                    (fromUpdatedAt as any).toISOString() :
                    fromUpdatedAt;
            }

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
        /**
         * List NFTs by contract address
         * @summary List NFTs by contract address
         * @param {string} contractAddress Contract address
         * @param {string} chainName The name of chain
         * @param {string} [fromUpdatedAt] Datetime to use as the oldest updated timestamp
         * @param {string} [pageCursor] Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
         * @param {number} [pageSize] Maximum number of items to return
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listNFTs: async (contractAddress: string, chainName: string, fromUpdatedAt?: string, pageCursor?: string, pageSize?: number, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'contractAddress' is not null or undefined
            assertParamExists('listNFTs', 'contractAddress', contractAddress)
            // verify required parameter 'chainName' is not null or undefined
            assertParamExists('listNFTs', 'chainName', chainName)
            const localVarPath = `/v1/chains/{chain_name}/collections/{contract_address}/nfts`
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

            if (fromUpdatedAt !== undefined) {
                localVarQueryParameter['from_updated_at'] = (fromUpdatedAt as any instanceof Date) ?
                    (fromUpdatedAt as any).toISOString() :
                    fromUpdatedAt;
            }

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
        /**
         * List NFTs by account address
         * @summary List NFTs by account address
         * @param {string} accountAddress Account address
         * @param {string} chainName The name of chain
         * @param {string} [contractAddress] The address of contract
         * @param {string} [pageCursor] Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
         * @param {number} [pageSize] Maximum number of items to return
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listNFTsByAccountAddress: async (accountAddress: string, chainName: string, contractAddress?: string, pageCursor?: string, pageSize?: number, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'accountAddress' is not null or undefined
            assertParamExists('listNFTsByAccountAddress', 'accountAddress', accountAddress)
            // verify required parameter 'chainName' is not null or undefined
            assertParamExists('listNFTsByAccountAddress', 'chainName', chainName)
            const localVarPath = `/v1/chains/{chain_name}/accounts/{account_address}/nfts`
                .replace(`{${"account_address"}}`, encodeURIComponent(String(accountAddress)))
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

            if (contractAddress !== undefined) {
                localVarQueryParameter['contract_address'] = contractAddress;
            }

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
 * NftsApi - functional programming interface
 * @export
 */
export const NftsApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = NftsApiAxiosParamCreator(configuration)
    return {
        /**
         * Get NFT by token ID
         * @summary Get NFT by token ID
         * @param {string} contractAddress The address of NFT contract
         * @param {string} tokenId An &#x60;uint256&#x60; token id as string
         * @param {string} chainName The name of chain
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getNFT(contractAddress: string, tokenId: string, chainName: string, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<GetNFTResult>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getNFT(contractAddress, tokenId, chainName, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * List all NFT owners on a chain
         * @summary List all NFT owners
         * @param {string} chainName The name of chain
         * @param {string} fromUpdatedAt Datetime to use as the oldest updated timestamp
         * @param {string} [pageCursor] Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
         * @param {number} [pageSize] Maximum number of items to return
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async listAllNFTOwners(chainName: string, fromUpdatedAt: string, pageCursor?: string, pageSize?: number, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<ListNFTOwnersResult>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.listAllNFTOwners(chainName, fromUpdatedAt, pageCursor, pageSize, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * List all NFTs on a chain
         * @summary List all NFTs
         * @param {string} chainName The name of chain
         * @param {string} [fromUpdatedAt] Datetime to use as the oldest updated timestamp
         * @param {string} [pageCursor] Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
         * @param {number} [pageSize] Maximum number of items to return
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async listAllNFTs(chainName: string, fromUpdatedAt?: string, pageCursor?: string, pageSize?: number, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<ListNFTsResult>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.listAllNFTs(chainName, fromUpdatedAt, pageCursor, pageSize, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * List NFTs by contract address
         * @summary List NFTs by contract address
         * @param {string} contractAddress Contract address
         * @param {string} chainName The name of chain
         * @param {string} [fromUpdatedAt] Datetime to use as the oldest updated timestamp
         * @param {string} [pageCursor] Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
         * @param {number} [pageSize] Maximum number of items to return
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async listNFTs(contractAddress: string, chainName: string, fromUpdatedAt?: string, pageCursor?: string, pageSize?: number, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<ListNFTsResult>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.listNFTs(contractAddress, chainName, fromUpdatedAt, pageCursor, pageSize, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * List NFTs by account address
         * @summary List NFTs by account address
         * @param {string} accountAddress Account address
         * @param {string} chainName The name of chain
         * @param {string} [contractAddress] The address of contract
         * @param {string} [pageCursor] Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
         * @param {number} [pageSize] Maximum number of items to return
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async listNFTsByAccountAddress(accountAddress: string, chainName: string, contractAddress?: string, pageCursor?: string, pageSize?: number, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<ListNFTsResult>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.listNFTsByAccountAddress(accountAddress, chainName, contractAddress, pageCursor, pageSize, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * NftsApi - factory interface
 * @export
 */
export const NftsApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = NftsApiFp(configuration)
    return {
        /**
         * Get NFT by token ID
         * @summary Get NFT by token ID
         * @param {NftsApiGetNFTRequest} requestParameters Request parameters.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getNFT(requestParameters: NftsApiGetNFTRequest, options?: AxiosRequestConfig): AxiosPromise<GetNFTResult> {
            return localVarFp.getNFT(requestParameters.contractAddress, requestParameters.tokenId, requestParameters.chainName, options).then((request) => request(axios, basePath));
        },
        /**
         * List all NFT owners on a chain
         * @summary List all NFT owners
         * @param {NftsApiListAllNFTOwnersRequest} requestParameters Request parameters.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listAllNFTOwners(requestParameters: NftsApiListAllNFTOwnersRequest, options?: AxiosRequestConfig): AxiosPromise<ListNFTOwnersResult> {
            return localVarFp.listAllNFTOwners(requestParameters.chainName, requestParameters.fromUpdatedAt, requestParameters.pageCursor, requestParameters.pageSize, options).then((request) => request(axios, basePath));
        },
        /**
         * List all NFTs on a chain
         * @summary List all NFTs
         * @param {NftsApiListAllNFTsRequest} requestParameters Request parameters.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listAllNFTs(requestParameters: NftsApiListAllNFTsRequest, options?: AxiosRequestConfig): AxiosPromise<ListNFTsResult> {
            return localVarFp.listAllNFTs(requestParameters.chainName, requestParameters.fromUpdatedAt, requestParameters.pageCursor, requestParameters.pageSize, options).then((request) => request(axios, basePath));
        },
        /**
         * List NFTs by contract address
         * @summary List NFTs by contract address
         * @param {NftsApiListNFTsRequest} requestParameters Request parameters.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listNFTs(requestParameters: NftsApiListNFTsRequest, options?: AxiosRequestConfig): AxiosPromise<ListNFTsResult> {
            return localVarFp.listNFTs(requestParameters.contractAddress, requestParameters.chainName, requestParameters.fromUpdatedAt, requestParameters.pageCursor, requestParameters.pageSize, options).then((request) => request(axios, basePath));
        },
        /**
         * List NFTs by account address
         * @summary List NFTs by account address
         * @param {NftsApiListNFTsByAccountAddressRequest} requestParameters Request parameters.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listNFTsByAccountAddress(requestParameters: NftsApiListNFTsByAccountAddressRequest, options?: AxiosRequestConfig): AxiosPromise<ListNFTsResult> {
            return localVarFp.listNFTsByAccountAddress(requestParameters.accountAddress, requestParameters.chainName, requestParameters.contractAddress, requestParameters.pageCursor, requestParameters.pageSize, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * Request parameters for getNFT operation in NftsApi.
 * @export
 * @interface NftsApiGetNFTRequest
 */
export interface NftsApiGetNFTRequest {
    /**
     * The address of NFT contract
     * @type {string}
     * @memberof NftsApiGetNFT
     */
    readonly contractAddress: string

    /**
     * An &#x60;uint256&#x60; token id as string
     * @type {string}
     * @memberof NftsApiGetNFT
     */
    readonly tokenId: string

    /**
     * The name of chain
     * @type {string}
     * @memberof NftsApiGetNFT
     */
    readonly chainName: string
}

/**
 * Request parameters for listAllNFTOwners operation in NftsApi.
 * @export
 * @interface NftsApiListAllNFTOwnersRequest
 */
export interface NftsApiListAllNFTOwnersRequest {
    /**
     * The name of chain
     * @type {string}
     * @memberof NftsApiListAllNFTOwners
     */
    readonly chainName: string

    /**
     * Datetime to use as the oldest updated timestamp
     * @type {string}
     * @memberof NftsApiListAllNFTOwners
     */
    readonly fromUpdatedAt: string

    /**
     * Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
     * @type {string}
     * @memberof NftsApiListAllNFTOwners
     */
    readonly pageCursor?: string

    /**
     * Maximum number of items to return
     * @type {number}
     * @memberof NftsApiListAllNFTOwners
     */
    readonly pageSize?: number
}

/**
 * Request parameters for listAllNFTs operation in NftsApi.
 * @export
 * @interface NftsApiListAllNFTsRequest
 */
export interface NftsApiListAllNFTsRequest {
    /**
     * The name of chain
     * @type {string}
     * @memberof NftsApiListAllNFTs
     */
    readonly chainName: string

    /**
     * Datetime to use as the oldest updated timestamp
     * @type {string}
     * @memberof NftsApiListAllNFTs
     */
    readonly fromUpdatedAt?: string

    /**
     * Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
     * @type {string}
     * @memberof NftsApiListAllNFTs
     */
    readonly pageCursor?: string

    /**
     * Maximum number of items to return
     * @type {number}
     * @memberof NftsApiListAllNFTs
     */
    readonly pageSize?: number
}

/**
 * Request parameters for listNFTs operation in NftsApi.
 * @export
 * @interface NftsApiListNFTsRequest
 */
export interface NftsApiListNFTsRequest {
    /**
     * Contract address
     * @type {string}
     * @memberof NftsApiListNFTs
     */
    readonly contractAddress: string

    /**
     * The name of chain
     * @type {string}
     * @memberof NftsApiListNFTs
     */
    readonly chainName: string

    /**
     * Datetime to use as the oldest updated timestamp
     * @type {string}
     * @memberof NftsApiListNFTs
     */
    readonly fromUpdatedAt?: string

    /**
     * Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
     * @type {string}
     * @memberof NftsApiListNFTs
     */
    readonly pageCursor?: string

    /**
     * Maximum number of items to return
     * @type {number}
     * @memberof NftsApiListNFTs
     */
    readonly pageSize?: number
}

/**
 * Request parameters for listNFTsByAccountAddress operation in NftsApi.
 * @export
 * @interface NftsApiListNFTsByAccountAddressRequest
 */
export interface NftsApiListNFTsByAccountAddressRequest {
    /**
     * Account address
     * @type {string}
     * @memberof NftsApiListNFTsByAccountAddress
     */
    readonly accountAddress: string

    /**
     * The name of chain
     * @type {string}
     * @memberof NftsApiListNFTsByAccountAddress
     */
    readonly chainName: string

    /**
     * The address of contract
     * @type {string}
     * @memberof NftsApiListNFTsByAccountAddress
     */
    readonly contractAddress?: string

    /**
     * Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
     * @type {string}
     * @memberof NftsApiListNFTsByAccountAddress
     */
    readonly pageCursor?: string

    /**
     * Maximum number of items to return
     * @type {number}
     * @memberof NftsApiListNFTsByAccountAddress
     */
    readonly pageSize?: number
}

/**
 * NftsApi - object-oriented interface
 * @export
 * @class NftsApi
 * @extends {BaseAPI}
 */
export class NftsApi extends BaseAPI {
    /**
     * Get NFT by token ID
     * @summary Get NFT by token ID
     * @param {NftsApiGetNFTRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof NftsApi
     */
    public getNFT(requestParameters: NftsApiGetNFTRequest, options?: AxiosRequestConfig) {
        return NftsApiFp(this.configuration).getNFT(requestParameters.contractAddress, requestParameters.tokenId, requestParameters.chainName, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * List all NFT owners on a chain
     * @summary List all NFT owners
     * @param {NftsApiListAllNFTOwnersRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof NftsApi
     */
    public listAllNFTOwners(requestParameters: NftsApiListAllNFTOwnersRequest, options?: AxiosRequestConfig) {
        return NftsApiFp(this.configuration).listAllNFTOwners(requestParameters.chainName, requestParameters.fromUpdatedAt, requestParameters.pageCursor, requestParameters.pageSize, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * List all NFTs on a chain
     * @summary List all NFTs
     * @param {NftsApiListAllNFTsRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof NftsApi
     */
    public listAllNFTs(requestParameters: NftsApiListAllNFTsRequest, options?: AxiosRequestConfig) {
        return NftsApiFp(this.configuration).listAllNFTs(requestParameters.chainName, requestParameters.fromUpdatedAt, requestParameters.pageCursor, requestParameters.pageSize, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * List NFTs by contract address
     * @summary List NFTs by contract address
     * @param {NftsApiListNFTsRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof NftsApi
     */
    public listNFTs(requestParameters: NftsApiListNFTsRequest, options?: AxiosRequestConfig) {
        return NftsApiFp(this.configuration).listNFTs(requestParameters.contractAddress, requestParameters.chainName, requestParameters.fromUpdatedAt, requestParameters.pageCursor, requestParameters.pageSize, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * List NFTs by account address
     * @summary List NFTs by account address
     * @param {NftsApiListNFTsByAccountAddressRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof NftsApi
     */
    public listNFTsByAccountAddress(requestParameters: NftsApiListNFTsByAccountAddressRequest, options?: AxiosRequestConfig) {
        return NftsApiFp(this.configuration).listNFTsByAccountAddress(requestParameters.accountAddress, requestParameters.chainName, requestParameters.contractAddress, requestParameters.pageCursor, requestParameters.pageSize, options).then((request) => request(this.axios, this.basePath));
    }
}

