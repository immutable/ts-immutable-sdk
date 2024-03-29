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
import { AcceptPrimarySaleBadRequestBody } from '../models';
// @ts-ignore
import { AcceptPrimarySaleForbiddenBody } from '../models';
// @ts-ignore
import { AcceptPrimarySaleInternalServerErrorBody } from '../models';
// @ts-ignore
import { AcceptPrimarySaleNotFoundBody } from '../models';
// @ts-ignore
import { AcceptPrimarySaleNotImplementedBody } from '../models';
// @ts-ignore
import { AcceptPrimarySaleOKBody } from '../models';
// @ts-ignore
import { AcceptPrimarySaleUnauthorizedBody } from '../models';
// @ts-ignore
import { AcceptPrimarySaleUnprocessableEntityBody } from '../models';
// @ts-ignore
import { CreatePrimarySaleBadRequestBody } from '../models';
// @ts-ignore
import { CreatePrimarySaleCreatedBody } from '../models';
// @ts-ignore
import { CreatePrimarySaleForbiddenBody } from '../models';
// @ts-ignore
import { CreatePrimarySaleInternalServerErrorBody } from '../models';
// @ts-ignore
import { CreatePrimarySaleNotFoundBody } from '../models';
// @ts-ignore
import { CreatePrimarySaleNotImplementedBody } from '../models';
// @ts-ignore
import { CreatePrimarySaleParamsBody } from '../models';
// @ts-ignore
import { CreatePrimarySaleUnauthorizedBody } from '../models';
// @ts-ignore
import { GetPrimarySaleBadRequestBody } from '../models';
// @ts-ignore
import { GetPrimarySaleInternalServerErrorBody } from '../models';
// @ts-ignore
import { GetPrimarySaleNotFoundBody } from '../models';
// @ts-ignore
import { GetPrimarySaleNotImplementedBody } from '../models';
// @ts-ignore
import { GetPrimarySaleOKBody } from '../models';
// @ts-ignore
import { RejectPrimarySaleBadRequestBody } from '../models';
// @ts-ignore
import { RejectPrimarySaleForbiddenBody } from '../models';
// @ts-ignore
import { RejectPrimarySaleInternalServerErrorBody } from '../models';
// @ts-ignore
import { RejectPrimarySaleNotFoundBody } from '../models';
// @ts-ignore
import { RejectPrimarySaleNotImplementedBody } from '../models';
// @ts-ignore
import { RejectPrimarySaleOKBody } from '../models';
// @ts-ignore
import { RejectPrimarySaleUnauthorizedBody } from '../models';
// @ts-ignore
import { RejectPrimarySaleUnprocessableEntityBody } from '../models';
// @ts-ignore
import { SignableAcceptPrimarySaleBadRequestBody } from '../models';
// @ts-ignore
import { SignableAcceptPrimarySaleInternalServerErrorBody } from '../models';
// @ts-ignore
import { SignableAcceptPrimarySaleNotFoundBody } from '../models';
// @ts-ignore
import { SignableAcceptPrimarySaleNotImplementedBody } from '../models';
// @ts-ignore
import { SignableAcceptPrimarySaleOKBody } from '../models';
// @ts-ignore
import { SignableAcceptPrimarySaleUnprocessableEntityBody } from '../models';
// @ts-ignore
import { SignableCreatePrimarySaleBadRequestBody } from '../models';
// @ts-ignore
import { SignableCreatePrimarySaleInternalServerErrorBody } from '../models';
// @ts-ignore
import { SignableCreatePrimarySaleNotFoundBody } from '../models';
// @ts-ignore
import { SignableCreatePrimarySaleNotImplementedBody } from '../models';
// @ts-ignore
import { SignableCreatePrimarySaleOKBody } from '../models';
// @ts-ignore
import { SignableCreatePrimarySaleParamsBody } from '../models';
// @ts-ignore
import { SignableRejectPrimarySaleBadRequestBody } from '../models';
// @ts-ignore
import { SignableRejectPrimarySaleInternalServerErrorBody } from '../models';
// @ts-ignore
import { SignableRejectPrimarySaleNotFoundBody } from '../models';
// @ts-ignore
import { SignableRejectPrimarySaleNotImplementedBody } from '../models';
// @ts-ignore
import { SignableRejectPrimarySaleOKBody } from '../models';
// @ts-ignore
import { SignableRejectPrimarySaleUnprocessableEntityBody } from '../models';
/**
 * PrimarySalesApi - axios parameter creator
 * @export
 */
export const PrimarySalesApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Accept Primary Sale.  This endpoint is experimental and may change in the future.
         * @summary Accept Primary Sale
         * @param {number} id Global Primary Sale identifier
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        acceptPrimarySale: async (id: number, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'id' is not null or undefined
            assertParamExists('acceptPrimarySale', 'id', id)
            const localVarPath = `/v1/primary_sales/{id}/accept`
                .replace(`{${"id"}}`, encodeURIComponent(String(id)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication ImxEthAddress required
            await setApiKeyToObject(localVarHeaderParameter, "x-imx-eth-address", configuration)

            // authentication ImxEthSignature required
            await setApiKeyToObject(localVarHeaderParameter, "x-imx-eth-signature", configuration)


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Create Primary Sale. This endpoint is experimental and may change in the future.
         * @summary Create Primary Sale
         * @param {CreatePrimarySaleParamsBody} [body] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createPrimarySale: async (body?: CreatePrimarySaleParamsBody, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/v1/primary_sales`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication ImxEthAddress required
            await setApiKeyToObject(localVarHeaderParameter, "x-imx-eth-address", configuration)

            // authentication ImxEthSignature required
            await setApiKeyToObject(localVarHeaderParameter, "x-imx-eth-signature", configuration)


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(body, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Get a single primary sale by ID. This endpoint is experimental and may change in the future.
         * @summary Get a single primary sale by ID
         * @param {number} id Global Primary Sale identifier
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getPrimarySale: async (id: number, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'id' is not null or undefined
            assertParamExists('getPrimarySale', 'id', id)
            const localVarPath = `/v1/primary_sales/{id}`
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
         * Reject Primary Sale.  This endpoint is experimental and may change in the future.
         * @summary Reject Primary Sale
         * @param {number} id Global Primary Sale identifier
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        rejectPrimarySale: async (id: number, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'id' is not null or undefined
            assertParamExists('rejectPrimarySale', 'id', id)
            const localVarPath = `/v1/primary_sales/{id}/reject`
                .replace(`{${"id"}}`, encodeURIComponent(String(id)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication ImxEthAddress required
            await setApiKeyToObject(localVarHeaderParameter, "x-imx-eth-address", configuration)

            // authentication ImxEthSignature required
            await setApiKeyToObject(localVarHeaderParameter, "x-imx-eth-signature", configuration)


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Signable Accept Primary Sale.  This endpoint is experimental and may change in the future.
         * @summary Signable Accept Primary Sale
         * @param {number} id Global Primary Sale identifier
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        signableAcceptPrimarySale: async (id: number, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'id' is not null or undefined
            assertParamExists('signableAcceptPrimarySale', 'id', id)
            const localVarPath = `/v1/primary_sales/{id}/signable-accept-details`
                .replace(`{${"id"}}`, encodeURIComponent(String(id)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
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
         * Signable Create Primary Sale.  This endpoint is experimental and may change in the future.
         * @summary Signable Create Primary Sale
         * @param {SignableCreatePrimarySaleParamsBody} [body] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        signableCreatePrimarySale: async (body?: SignableCreatePrimarySaleParamsBody, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/v1/primary_sales/signable-primary-sale-details`;
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
            localVarRequestOptions.data = serializeDataIfNeeded(body, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Signable Reject Primary Sale.  This endpoint is experimental and may change in the future.
         * @summary Signable Reject Primary Sale
         * @param {number} id Global Primary Sale identifier
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        signableRejectPrimarySale: async (id: number, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'id' is not null or undefined
            assertParamExists('signableRejectPrimarySale', 'id', id)
            const localVarPath = `/v1/primary_sales/{id}/signable-reject-details`
                .replace(`{${"id"}}`, encodeURIComponent(String(id)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
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
    }
};

/**
 * PrimarySalesApi - functional programming interface
 * @export
 */
export const PrimarySalesApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = PrimarySalesApiAxiosParamCreator(configuration)
    return {
        /**
         * Accept Primary Sale.  This endpoint is experimental and may change in the future.
         * @summary Accept Primary Sale
         * @param {number} id Global Primary Sale identifier
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async acceptPrimarySale(id: number, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<AcceptPrimarySaleOKBody>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.acceptPrimarySale(id, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Create Primary Sale. This endpoint is experimental and may change in the future.
         * @summary Create Primary Sale
         * @param {CreatePrimarySaleParamsBody} [body] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async createPrimarySale(body?: CreatePrimarySaleParamsBody, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<CreatePrimarySaleCreatedBody>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.createPrimarySale(body, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Get a single primary sale by ID. This endpoint is experimental and may change in the future.
         * @summary Get a single primary sale by ID
         * @param {number} id Global Primary Sale identifier
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getPrimarySale(id: number, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<GetPrimarySaleOKBody>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getPrimarySale(id, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Reject Primary Sale.  This endpoint is experimental and may change in the future.
         * @summary Reject Primary Sale
         * @param {number} id Global Primary Sale identifier
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async rejectPrimarySale(id: number, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<RejectPrimarySaleOKBody>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.rejectPrimarySale(id, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Signable Accept Primary Sale.  This endpoint is experimental and may change in the future.
         * @summary Signable Accept Primary Sale
         * @param {number} id Global Primary Sale identifier
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async signableAcceptPrimarySale(id: number, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<SignableAcceptPrimarySaleOKBody>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.signableAcceptPrimarySale(id, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Signable Create Primary Sale.  This endpoint is experimental and may change in the future.
         * @summary Signable Create Primary Sale
         * @param {SignableCreatePrimarySaleParamsBody} [body] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async signableCreatePrimarySale(body?: SignableCreatePrimarySaleParamsBody, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<SignableCreatePrimarySaleOKBody>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.signableCreatePrimarySale(body, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Signable Reject Primary Sale.  This endpoint is experimental and may change in the future.
         * @summary Signable Reject Primary Sale
         * @param {number} id Global Primary Sale identifier
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async signableRejectPrimarySale(id: number, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<SignableRejectPrimarySaleOKBody>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.signableRejectPrimarySale(id, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * PrimarySalesApi - factory interface
 * @export
 */
export const PrimarySalesApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = PrimarySalesApiFp(configuration)
    return {
        /**
         * Accept Primary Sale.  This endpoint is experimental and may change in the future.
         * @summary Accept Primary Sale
         * @param {number} id Global Primary Sale identifier
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        acceptPrimarySale(id: number, options?: any): AxiosPromise<AcceptPrimarySaleOKBody> {
            return localVarFp.acceptPrimarySale(id, options).then((request) => request(axios, basePath));
        },
        /**
         * Create Primary Sale. This endpoint is experimental and may change in the future.
         * @summary Create Primary Sale
         * @param {CreatePrimarySaleParamsBody} [body] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createPrimarySale(body?: CreatePrimarySaleParamsBody, options?: any): AxiosPromise<CreatePrimarySaleCreatedBody> {
            return localVarFp.createPrimarySale(body, options).then((request) => request(axios, basePath));
        },
        /**
         * Get a single primary sale by ID. This endpoint is experimental and may change in the future.
         * @summary Get a single primary sale by ID
         * @param {number} id Global Primary Sale identifier
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getPrimarySale(id: number, options?: any): AxiosPromise<GetPrimarySaleOKBody> {
            return localVarFp.getPrimarySale(id, options).then((request) => request(axios, basePath));
        },
        /**
         * Reject Primary Sale.  This endpoint is experimental and may change in the future.
         * @summary Reject Primary Sale
         * @param {number} id Global Primary Sale identifier
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        rejectPrimarySale(id: number, options?: any): AxiosPromise<RejectPrimarySaleOKBody> {
            return localVarFp.rejectPrimarySale(id, options).then((request) => request(axios, basePath));
        },
        /**
         * Signable Accept Primary Sale.  This endpoint is experimental and may change in the future.
         * @summary Signable Accept Primary Sale
         * @param {number} id Global Primary Sale identifier
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        signableAcceptPrimarySale(id: number, options?: any): AxiosPromise<SignableAcceptPrimarySaleOKBody> {
            return localVarFp.signableAcceptPrimarySale(id, options).then((request) => request(axios, basePath));
        },
        /**
         * Signable Create Primary Sale.  This endpoint is experimental and may change in the future.
         * @summary Signable Create Primary Sale
         * @param {SignableCreatePrimarySaleParamsBody} [body] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        signableCreatePrimarySale(body?: SignableCreatePrimarySaleParamsBody, options?: any): AxiosPromise<SignableCreatePrimarySaleOKBody> {
            return localVarFp.signableCreatePrimarySale(body, options).then((request) => request(axios, basePath));
        },
        /**
         * Signable Reject Primary Sale.  This endpoint is experimental and may change in the future.
         * @summary Signable Reject Primary Sale
         * @param {number} id Global Primary Sale identifier
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        signableRejectPrimarySale(id: number, options?: any): AxiosPromise<SignableRejectPrimarySaleOKBody> {
            return localVarFp.signableRejectPrimarySale(id, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * Request parameters for acceptPrimarySale operation in PrimarySalesApi.
 * @export
 * @interface PrimarySalesApiAcceptPrimarySaleRequest
 */
export interface PrimarySalesApiAcceptPrimarySaleRequest {
    /**
     * Global Primary Sale identifier
     * @type {number}
     * @memberof PrimarySalesApiAcceptPrimarySale
     */
    readonly id: number
}

/**
 * Request parameters for createPrimarySale operation in PrimarySalesApi.
 * @export
 * @interface PrimarySalesApiCreatePrimarySaleRequest
 */
export interface PrimarySalesApiCreatePrimarySaleRequest {
    /**
     * 
     * @type {CreatePrimarySaleParamsBody}
     * @memberof PrimarySalesApiCreatePrimarySale
     */
    readonly body?: CreatePrimarySaleParamsBody
}

/**
 * Request parameters for getPrimarySale operation in PrimarySalesApi.
 * @export
 * @interface PrimarySalesApiGetPrimarySaleRequest
 */
export interface PrimarySalesApiGetPrimarySaleRequest {
    /**
     * Global Primary Sale identifier
     * @type {number}
     * @memberof PrimarySalesApiGetPrimarySale
     */
    readonly id: number
}

/**
 * Request parameters for rejectPrimarySale operation in PrimarySalesApi.
 * @export
 * @interface PrimarySalesApiRejectPrimarySaleRequest
 */
export interface PrimarySalesApiRejectPrimarySaleRequest {
    /**
     * Global Primary Sale identifier
     * @type {number}
     * @memberof PrimarySalesApiRejectPrimarySale
     */
    readonly id: number
}

/**
 * Request parameters for signableAcceptPrimarySale operation in PrimarySalesApi.
 * @export
 * @interface PrimarySalesApiSignableAcceptPrimarySaleRequest
 */
export interface PrimarySalesApiSignableAcceptPrimarySaleRequest {
    /**
     * Global Primary Sale identifier
     * @type {number}
     * @memberof PrimarySalesApiSignableAcceptPrimarySale
     */
    readonly id: number
}

/**
 * Request parameters for signableCreatePrimarySale operation in PrimarySalesApi.
 * @export
 * @interface PrimarySalesApiSignableCreatePrimarySaleRequest
 */
export interface PrimarySalesApiSignableCreatePrimarySaleRequest {
    /**
     * 
     * @type {SignableCreatePrimarySaleParamsBody}
     * @memberof PrimarySalesApiSignableCreatePrimarySale
     */
    readonly body?: SignableCreatePrimarySaleParamsBody
}

/**
 * Request parameters for signableRejectPrimarySale operation in PrimarySalesApi.
 * @export
 * @interface PrimarySalesApiSignableRejectPrimarySaleRequest
 */
export interface PrimarySalesApiSignableRejectPrimarySaleRequest {
    /**
     * Global Primary Sale identifier
     * @type {number}
     * @memberof PrimarySalesApiSignableRejectPrimarySale
     */
    readonly id: number
}

/**
 * PrimarySalesApi - object-oriented interface
 * @export
 * @class PrimarySalesApi
 * @extends {BaseAPI}
 */
export class PrimarySalesApi extends BaseAPI {
    /**
     * Accept Primary Sale.  This endpoint is experimental and may change in the future.
     * @summary Accept Primary Sale
     * @param {PrimarySalesApiAcceptPrimarySaleRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PrimarySalesApi
     */
    public acceptPrimarySale(requestParameters: PrimarySalesApiAcceptPrimarySaleRequest, options?: AxiosRequestConfig) {
        return PrimarySalesApiFp(this.configuration).acceptPrimarySale(requestParameters.id, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Create Primary Sale. This endpoint is experimental and may change in the future.
     * @summary Create Primary Sale
     * @param {PrimarySalesApiCreatePrimarySaleRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PrimarySalesApi
     */
    public createPrimarySale(requestParameters: PrimarySalesApiCreatePrimarySaleRequest = {}, options?: AxiosRequestConfig) {
        return PrimarySalesApiFp(this.configuration).createPrimarySale(requestParameters.body, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Get a single primary sale by ID. This endpoint is experimental and may change in the future.
     * @summary Get a single primary sale by ID
     * @param {PrimarySalesApiGetPrimarySaleRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PrimarySalesApi
     */
    public getPrimarySale(requestParameters: PrimarySalesApiGetPrimarySaleRequest, options?: AxiosRequestConfig) {
        return PrimarySalesApiFp(this.configuration).getPrimarySale(requestParameters.id, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Reject Primary Sale.  This endpoint is experimental and may change in the future.
     * @summary Reject Primary Sale
     * @param {PrimarySalesApiRejectPrimarySaleRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PrimarySalesApi
     */
    public rejectPrimarySale(requestParameters: PrimarySalesApiRejectPrimarySaleRequest, options?: AxiosRequestConfig) {
        return PrimarySalesApiFp(this.configuration).rejectPrimarySale(requestParameters.id, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Signable Accept Primary Sale.  This endpoint is experimental and may change in the future.
     * @summary Signable Accept Primary Sale
     * @param {PrimarySalesApiSignableAcceptPrimarySaleRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PrimarySalesApi
     */
    public signableAcceptPrimarySale(requestParameters: PrimarySalesApiSignableAcceptPrimarySaleRequest, options?: AxiosRequestConfig) {
        return PrimarySalesApiFp(this.configuration).signableAcceptPrimarySale(requestParameters.id, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Signable Create Primary Sale.  This endpoint is experimental and may change in the future.
     * @summary Signable Create Primary Sale
     * @param {PrimarySalesApiSignableCreatePrimarySaleRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PrimarySalesApi
     */
    public signableCreatePrimarySale(requestParameters: PrimarySalesApiSignableCreatePrimarySaleRequest = {}, options?: AxiosRequestConfig) {
        return PrimarySalesApiFp(this.configuration).signableCreatePrimarySale(requestParameters.body, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Signable Reject Primary Sale.  This endpoint is experimental and may change in the future.
     * @summary Signable Reject Primary Sale
     * @param {PrimarySalesApiSignableRejectPrimarySaleRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PrimarySalesApi
     */
    public signableRejectPrimarySale(requestParameters: PrimarySalesApiSignableRejectPrimarySaleRequest, options?: AxiosRequestConfig) {
        return PrimarySalesApiFp(this.configuration).signableRejectPrimarySale(requestParameters.id, options).then((request) => request(this.axios, this.basePath));
    }
}
