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
import { APIError401 } from '../models';
// @ts-ignore
import { APIError403 } from '../models';
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
/**
 * PassportApi - axios parameter creator
 * @export
 */
export const PassportApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Create a counterfactual address for a user based on their Ethereum address
         * @summary Create a counterfactual address
         * @param {CreateCounterfactualAddressRequest} createCounterfactualAddressRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createCounterfactualAddress: async (createCounterfactualAddressRequest: CreateCounterfactualAddressRequest, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'createCounterfactualAddressRequest' is not null or undefined
            assertParamExists('createCounterfactualAddress', 'createCounterfactualAddressRequest', createCounterfactualAddressRequest)
            const localVarPath = `/passport-mr/v1/counterfactual-address`;
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
         * @summary Create a counterfactual address
         * @param {CreateCounterfactualAddressRequest} createCounterfactualAddressRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async createCounterfactualAddress(createCounterfactualAddressRequest: CreateCounterfactualAddressRequest, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<CreateCounterfactualAddressRes>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.createCounterfactualAddress(createCounterfactualAddressRequest, options);
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
         * @summary Create a counterfactual address
         * @param {CreateCounterfactualAddressRequest} createCounterfactualAddressRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createCounterfactualAddress(createCounterfactualAddressRequest: CreateCounterfactualAddressRequest, options?: any): AxiosPromise<CreateCounterfactualAddressRes> {
            return localVarFp.createCounterfactualAddress(createCounterfactualAddressRequest, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * Request parameters for createCounterfactualAddress operation in PassportApi.
 * @export
 * @interface PassportApiCreateCounterfactualAddressRequest
 */
export interface PassportApiCreateCounterfactualAddressRequest {
    /**
     * 
     * @type {CreateCounterfactualAddressRequest}
     * @memberof PassportApiCreateCounterfactualAddress
     */
    readonly createCounterfactualAddressRequest: CreateCounterfactualAddressRequest
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
     * @summary Create a counterfactual address
     * @param {PassportApiCreateCounterfactualAddressRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PassportApi
     */
    public createCounterfactualAddress(requestParameters: PassportApiCreateCounterfactualAddressRequest, options?: AxiosRequestConfig) {
        return PassportApiFp(this.configuration).createCounterfactualAddress(requestParameters.createCounterfactualAddressRequest, options).then((request) => request(this.axios, this.basePath));
    }
}
