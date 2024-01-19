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
import { ApiRegisterPassportUserRequest } from '../models';
// @ts-ignore
import { GetSignableRegistrationOffchainResponse } from '../models';
// @ts-ignore
import { GetSignableRegistrationRequest } from '../models';
// @ts-ignore
import { GetSignableRegistrationResponse } from '../models';
// @ts-ignore
import { GetUsersApiResponse } from '../models';
// @ts-ignore
import { RegisterPassportUserResult } from '../models';
// @ts-ignore
import { RegisterUserRequest } from '../models';
// @ts-ignore
import { RegisterUserResponse } from '../models';
/**
 * UsersApi - axios parameter creator
 * @export
 */
export const UsersApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Get operator signature to allow clients to register the user
         * @summary Get operator signature to allow clients to register the user
         * @param {GetSignableRegistrationRequest} getSignableRegistrationRequest Register User
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getSignableRegistration: async (getSignableRegistrationRequest: GetSignableRegistrationRequest, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'getSignableRegistrationRequest' is not null or undefined
            assertParamExists('getSignableRegistration', 'getSignableRegistrationRequest', getSignableRegistrationRequest)
            const localVarPath = `/v1/signable-registration`;
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
            localVarRequestOptions.data = serializeDataIfNeeded(getSignableRegistrationRequest, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Get encoded details to allow clients to register the user offchain
         * @summary Get encoded details to allow clients to register the user offchain
         * @param {GetSignableRegistrationRequest} getSignableRegistrationRequest Register User Offchain
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getSignableRegistrationOffchain: async (getSignableRegistrationRequest: GetSignableRegistrationRequest, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'getSignableRegistrationRequest' is not null or undefined
            assertParamExists('getSignableRegistrationOffchain', 'getSignableRegistrationRequest', getSignableRegistrationRequest)
            const localVarPath = `/v1/signable-registration-offchain`;
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
            localVarRequestOptions.data = serializeDataIfNeeded(getSignableRegistrationRequest, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Get stark keys for a registered user
         * @summary Get stark keys for a registered user
         * @param {string} user User
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getUsers: async (user: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'user' is not null or undefined
            assertParamExists('getUsers', 'user', user)
            const localVarPath = `/v1/users/{user}`
                .replace(`{${"user"}}`, encodeURIComponent(String(user)));
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
         * Registers a passport user
         * @summary Registers a passport user
         * @param {string} authorization Authorization header
         * @param {ApiRegisterPassportUserRequest} registerPassportUserRequest Register Passport User
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        registerPassportUser: async (authorization: string, registerPassportUserRequest: ApiRegisterPassportUserRequest, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'authorization' is not null or undefined
            assertParamExists('registerPassportUser', 'authorization', authorization)
            // verify required parameter 'registerPassportUserRequest' is not null or undefined
            assertParamExists('registerPassportUser', 'registerPassportUserRequest', registerPassportUserRequest)
            const localVarPath = `/v1/passport/users`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            if (authorization != null) {
                localVarHeaderParameter['Authorization'] = String(authorization);
            }


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(registerPassportUserRequest, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Registers a passport user
         * @summary Registers a passport user
         * @param {string} authorization Authorization header
         * @param {ApiRegisterPassportUserRequest} registerPassportUserRequest Register Passport User
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        registerPassportUserV2: async (authorization: string, registerPassportUserRequest: ApiRegisterPassportUserRequest, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'authorization' is not null or undefined
            assertParamExists('registerPassportUserV2', 'authorization', authorization)
            // verify required parameter 'registerPassportUserRequest' is not null or undefined
            assertParamExists('registerPassportUserV2', 'registerPassportUserRequest', registerPassportUserRequest)
            const localVarPath = `/v2/passport/users`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            if (authorization != null) {
                localVarHeaderParameter['Authorization'] = String(authorization);
            }


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(registerPassportUserRequest, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Registers a user
         * @summary Registers a user
         * @param {RegisterUserRequest} registerUserRequest Register User
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        registerUser: async (registerUserRequest: RegisterUserRequest, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'registerUserRequest' is not null or undefined
            assertParamExists('registerUser', 'registerUserRequest', registerUserRequest)
            const localVarPath = `/v1/users`;
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
            localVarRequestOptions.data = serializeDataIfNeeded(registerUserRequest, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * UsersApi - functional programming interface
 * @export
 */
export const UsersApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = UsersApiAxiosParamCreator(configuration)
    return {
        /**
         * Get operator signature to allow clients to register the user
         * @summary Get operator signature to allow clients to register the user
         * @param {GetSignableRegistrationRequest} getSignableRegistrationRequest Register User
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getSignableRegistration(getSignableRegistrationRequest: GetSignableRegistrationRequest, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<GetSignableRegistrationResponse>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getSignableRegistration(getSignableRegistrationRequest, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Get encoded details to allow clients to register the user offchain
         * @summary Get encoded details to allow clients to register the user offchain
         * @param {GetSignableRegistrationRequest} getSignableRegistrationRequest Register User Offchain
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getSignableRegistrationOffchain(getSignableRegistrationRequest: GetSignableRegistrationRequest, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<GetSignableRegistrationOffchainResponse>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getSignableRegistrationOffchain(getSignableRegistrationRequest, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Get stark keys for a registered user
         * @summary Get stark keys for a registered user
         * @param {string} user User
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getUsers(user: string, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<GetUsersApiResponse>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getUsers(user, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Registers a passport user
         * @summary Registers a passport user
         * @param {string} authorization Authorization header
         * @param {ApiRegisterPassportUserRequest} registerPassportUserRequest Register Passport User
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async registerPassportUser(authorization: string, registerPassportUserRequest: ApiRegisterPassportUserRequest, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<RegisterPassportUserResult>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.registerPassportUser(authorization, registerPassportUserRequest, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Registers a passport user
         * @summary Registers a passport user
         * @param {string} authorization Authorization header
         * @param {ApiRegisterPassportUserRequest} registerPassportUserRequest Register Passport User
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async registerPassportUserV2(authorization: string, registerPassportUserRequest: ApiRegisterPassportUserRequest, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<RegisterPassportUserResult>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.registerPassportUserV2(authorization, registerPassportUserRequest, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Registers a user
         * @summary Registers a user
         * @param {RegisterUserRequest} registerUserRequest Register User
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async registerUser(registerUserRequest: RegisterUserRequest, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<RegisterUserResponse>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.registerUser(registerUserRequest, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * UsersApi - factory interface
 * @export
 */
export const UsersApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = UsersApiFp(configuration)
    return {
        /**
         * Get operator signature to allow clients to register the user
         * @summary Get operator signature to allow clients to register the user
         * @param {GetSignableRegistrationRequest} getSignableRegistrationRequest Register User
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getSignableRegistration(getSignableRegistrationRequest: GetSignableRegistrationRequest, options?: any): AxiosPromise<GetSignableRegistrationResponse> {
            return localVarFp.getSignableRegistration(getSignableRegistrationRequest, options).then((request) => request(axios, basePath));
        },
        /**
         * Get encoded details to allow clients to register the user offchain
         * @summary Get encoded details to allow clients to register the user offchain
         * @param {GetSignableRegistrationRequest} getSignableRegistrationRequest Register User Offchain
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getSignableRegistrationOffchain(getSignableRegistrationRequest: GetSignableRegistrationRequest, options?: any): AxiosPromise<GetSignableRegistrationOffchainResponse> {
            return localVarFp.getSignableRegistrationOffchain(getSignableRegistrationRequest, options).then((request) => request(axios, basePath));
        },
        /**
         * Get stark keys for a registered user
         * @summary Get stark keys for a registered user
         * @param {string} user User
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getUsers(user: string, options?: any): AxiosPromise<GetUsersApiResponse> {
            return localVarFp.getUsers(user, options).then((request) => request(axios, basePath));
        },
        /**
         * Registers a passport user
         * @summary Registers a passport user
         * @param {string} authorization Authorization header
         * @param {ApiRegisterPassportUserRequest} registerPassportUserRequest Register Passport User
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        registerPassportUser(authorization: string, registerPassportUserRequest: ApiRegisterPassportUserRequest, options?: any): AxiosPromise<RegisterPassportUserResult> {
            return localVarFp.registerPassportUser(authorization, registerPassportUserRequest, options).then((request) => request(axios, basePath));
        },
        /**
         * Registers a passport user
         * @summary Registers a passport user
         * @param {string} authorization Authorization header
         * @param {ApiRegisterPassportUserRequest} registerPassportUserRequest Register Passport User
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        registerPassportUserV2(authorization: string, registerPassportUserRequest: ApiRegisterPassportUserRequest, options?: any): AxiosPromise<RegisterPassportUserResult> {
            return localVarFp.registerPassportUserV2(authorization, registerPassportUserRequest, options).then((request) => request(axios, basePath));
        },
        /**
         * Registers a user
         * @summary Registers a user
         * @param {RegisterUserRequest} registerUserRequest Register User
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        registerUser(registerUserRequest: RegisterUserRequest, options?: any): AxiosPromise<RegisterUserResponse> {
            return localVarFp.registerUser(registerUserRequest, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * Request parameters for getSignableRegistration operation in UsersApi.
 * @export
 * @interface UsersApiGetSignableRegistrationRequest
 */
export interface UsersApiGetSignableRegistrationRequest {
    /**
     * Register User
     * @type {GetSignableRegistrationRequest}
     * @memberof UsersApiGetSignableRegistration
     */
    readonly getSignableRegistrationRequest: GetSignableRegistrationRequest
}

/**
 * Request parameters for getSignableRegistrationOffchain operation in UsersApi.
 * @export
 * @interface UsersApiGetSignableRegistrationOffchainRequest
 */
export interface UsersApiGetSignableRegistrationOffchainRequest {
    /**
     * Register User Offchain
     * @type {GetSignableRegistrationRequest}
     * @memberof UsersApiGetSignableRegistrationOffchain
     */
    readonly getSignableRegistrationRequest: GetSignableRegistrationRequest
}

/**
 * Request parameters for getUsers operation in UsersApi.
 * @export
 * @interface UsersApiGetUsersRequest
 */
export interface UsersApiGetUsersRequest {
    /**
     * User
     * @type {string}
     * @memberof UsersApiGetUsers
     */
    readonly user: string
}

/**
 * Request parameters for registerPassportUser operation in UsersApi.
 * @export
 * @interface UsersApiRegisterPassportUserRequest
 */
export interface UsersApiRegisterPassportUserRequest {
    /**
     * Authorization header
     * @type {string}
     * @memberof UsersApiRegisterPassportUser
     */
    readonly authorization: string

    /**
     * Register Passport User
     * @type {ApiRegisterPassportUserRequest}
     * @memberof UsersApiRegisterPassportUser
     */
    readonly registerPassportUserRequest: ApiRegisterPassportUserRequest
}

/**
 * Request parameters for registerPassportUserV2 operation in UsersApi.
 * @export
 * @interface UsersApiRegisterPassportUserV2Request
 */
export interface UsersApiRegisterPassportUserV2Request {
    /**
     * Authorization header
     * @type {string}
     * @memberof UsersApiRegisterPassportUserV2
     */
    readonly authorization: string

    /**
     * Register Passport User
     * @type {ApiRegisterPassportUserRequest}
     * @memberof UsersApiRegisterPassportUserV2
     */
    readonly registerPassportUserRequest: ApiRegisterPassportUserRequest
}

/**
 * Request parameters for registerUser operation in UsersApi.
 * @export
 * @interface UsersApiRegisterUserRequest
 */
export interface UsersApiRegisterUserRequest {
    /**
     * Register User
     * @type {RegisterUserRequest}
     * @memberof UsersApiRegisterUser
     */
    readonly registerUserRequest: RegisterUserRequest
}

/**
 * UsersApi - object-oriented interface
 * @export
 * @class UsersApi
 * @extends {BaseAPI}
 */
export class UsersApi extends BaseAPI {
    /**
     * Get operator signature to allow clients to register the user
     * @summary Get operator signature to allow clients to register the user
     * @param {UsersApiGetSignableRegistrationRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    public getSignableRegistration(requestParameters: UsersApiGetSignableRegistrationRequest, options?: AxiosRequestConfig) {
        return UsersApiFp(this.configuration).getSignableRegistration(requestParameters.getSignableRegistrationRequest, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Get encoded details to allow clients to register the user offchain
     * @summary Get encoded details to allow clients to register the user offchain
     * @param {UsersApiGetSignableRegistrationOffchainRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    public getSignableRegistrationOffchain(requestParameters: UsersApiGetSignableRegistrationOffchainRequest, options?: AxiosRequestConfig) {
        return UsersApiFp(this.configuration).getSignableRegistrationOffchain(requestParameters.getSignableRegistrationRequest, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Get stark keys for a registered user
     * @summary Get stark keys for a registered user
     * @param {UsersApiGetUsersRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    public getUsers(requestParameters: UsersApiGetUsersRequest, options?: AxiosRequestConfig) {
        return UsersApiFp(this.configuration).getUsers(requestParameters.user, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Registers a passport user
     * @summary Registers a passport user
     * @param {UsersApiRegisterPassportUserRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    public registerPassportUser(requestParameters: UsersApiRegisterPassportUserRequest, options?: AxiosRequestConfig) {
        return UsersApiFp(this.configuration).registerPassportUser(requestParameters.authorization, requestParameters.registerPassportUserRequest, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Registers a passport user
     * @summary Registers a passport user
     * @param {UsersApiRegisterPassportUserV2Request} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    public registerPassportUserV2(requestParameters: UsersApiRegisterPassportUserV2Request, options?: AxiosRequestConfig) {
        return UsersApiFp(this.configuration).registerPassportUserV2(requestParameters.authorization, requestParameters.registerPassportUserRequest, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Registers a user
     * @summary Registers a user
     * @param {UsersApiRegisterUserRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    public registerUser(requestParameters: UsersApiRegisterUserRequest, options?: AxiosRequestConfig) {
        return UsersApiFp(this.configuration).registerUser(requestParameters.registerUserRequest, options).then((request) => request(this.axios, this.basePath));
    }
}
