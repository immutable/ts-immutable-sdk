/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface HttpCreateItemDefinitionRequest {
  /** @example "Deal 3 damage to a random sleeping enemy creature" */
  description?: string;
  /** @example "shardbound" */
  game_id: string;
  /**
   * Image URL
   * @example "https://images.godsunchained.com/art2/500/94.webp"
   */
  image?: string;
  /** @example "a8a9c29b-018d-43fe-b2d4-963a781161f0" */
  item_template_id: string;
  /** @example "Demogorgon" */
  name: string;
  /** JSON Object of item properties */
  properties?: object;
}

export interface HttpCreateItemTemplateRequest {
  /** @example "shardbound" */
  game_id: string;
  /** @example "Creature" */
  name: string;
  property_schema: ItemPropertySchema[];
  /** @example "a8a9c29b-018d-43fe-b2d4-963a781161f0" */
  type_id: string;
}

export interface HttpUpdateItemDefinitionRequest {
  /** @example "Deal 3 damage to a random sleeping enemy creature" */
  description?: string;
  /**
   * Image URL
   * @example "https://images.godsunchained.com/art2/500/94.webp"
   */
  image?: string;
  /** @example "a8a9c29b-018d-43fe-b2d4-963a781161f0" */
  item_template_id: string;
  /** @example "Demogorgon" */
  name: string;
  /** JSON Object of item properties */
  properties?: object;
  /** @example "draft" */
  status?: 'draft' | 'published';
}

export interface ItemCreationPayloadOutput {
  properties?: Record<string, any>;
}

export interface ItemDefinition {
  /** @example "2023-03-01T12:00:00.000Z" */
  created_at?: string;
  /** @example "Deal 3 damage to a random sleeping enemy creature" */
  description?: string;
  /** @example "shardbound" */
  game_id?: string;
  /** @example "ec950ac3-b3bf-4b81-8b17-576234eabd41" */
  id?: string;
  /**
   * Image URL
   * @example "https://images.godsunchained.com/art2/500/94.webp"
   */
  image?: string;
  /** @example "a8a9c29b-018d-43fe-b2d4-963a781161f0" */
  item_template_id?: string;
  /** @example "Demogorgon" */
  name?: string;
  /** JSON Object of item properties */
  properties?: object;
  property_schema?: ItemPropertySchema[];
  /** @example "2023-03-02T12:00:00.000Z" */
  published_at?: string;
  /** @example "published" */
  status?: 'draft' | 'published';
  /** @example "Card" */
  type?: string;
  /** @example "2023-03-02T12:00:00.000Z" */
  updated_at?: string;
}

export interface ItemPropertySchema {
  /** @example false */
  dynamic?: boolean;
  /** @example "off-chain" */
  location: string;
  /** @example "Mana" */
  name: string;
  /** @example true */
  required?: boolean;
  /** Map of property schema rules. Valid keys are "enum", "min", and "max" */
  rules?: object;
  /** @example "int" */
  type?: string;
}

export interface ItemTemplate {
  /** @example "2023-03-01T12:00:00.000Z" */
  created_at?: string;
  /** @example "sb" */
  game_id?: string;
  /** @example "a8a9c29b-018d-43fe-b2d4-963a781161f0" */
  id?: string;
  /** @example "Creature" */
  name?: string;
  property_schema?: ItemPropertySchema[];
  /** @example "Card" */
  type?: string;
  /** @example "3e58eba-0f1b-4ed3-a1e8-d925ddc009c1" */
  type_id?: string;
  /** @example "2023-03-02T12:00:00.000Z" */
  updated_at?: string;
}

export interface ItemType {
  game_id?: string;
  id?: string;
  name?: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>;

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = '/item-definition/v1';
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&');
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => 'undefined' !== typeof query[key]);
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join('&');
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : '';
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string') ? JSON.stringify(input) : input,
    [ContentType.Text]: (input: any) => (input !== null && typeof input !== 'string' ? JSON.stringify(input) : input),
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === 'object' && property !== null
            ? JSON.stringify(property)
            : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(`${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`, {
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {}),
      },
      signal: cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal,
      body: typeof body === 'undefined' || body === null ? null : payloadFormatter(body),
    }).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title ItemDefinition API
 * @version 1.0
 * @baseUrl /item-definition/v1
 * @contact
 *
 * Item Definition API
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  definitions = {
    /**
     * @description List all definitions for a given Game ID
     *
     * @tags root
     * @name DefinitionsList
     * @summary List item definitions
     * @request GET:/definitions
     */
    definitionsList: (
      query: {
        /** The Game ID you want definitions for */
        game_id: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ItemDefinition[], any>({
        path: `/definitions`,
        method: 'GET',
        query: query,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create item definition
     *
     * @tags root
     * @name DefinitionsCreate
     * @summary Create item definition
     * @request POST:/definitions
     */
    definitionsCreate: (request: HttpCreateItemDefinitionRequest, params: RequestParams = {}) =>
      this.request<ItemDefinition, any>({
        path: `/definitions`,
        method: 'POST',
        body: request,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get item definition given an ID
     *
     * @tags root
     * @name DefinitionsDetail
     * @summary Get item definition
     * @request GET:/definitions/{id}
     */
    definitionsDetail: (id: string, params: RequestParams = {}) =>
      this.request<ItemDefinition, any>({
        path: `/definitions/${id}`,
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Update item definition
     *
     * @tags root
     * @name DefinitionsUpdate
     * @summary Update item definition
     * @request PUT:/definitions/{id}
     */
    definitionsUpdate: (id: string, request: HttpUpdateItemDefinitionRequest, params: RequestParams = {}) =>
      this.request<ItemDefinition, any>({
        path: `/definitions/${id}`,
        method: 'PUT',
        body: request,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Validate metadata against a definition's template additional properties
     *
     * @tags root
     * @name ValidateCreate
     * @summary Validate metadata against a definition
     * @request POST:/definitions/{id}/validate
     */
    validateCreate: (id: string, request: object, params: RequestParams = {}) =>
      this.request<ItemCreationPayloadOutput, any>({
        path: `/definitions/${id}/validate`,
        method: 'POST',
        body: request,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  };
  templates = {
    /**
     * @description List all templates for a given Game ID
     *
     * @tags root
     * @name TemplatesList
     * @summary List item templates
     * @request GET:/templates
     */
    templatesList: (
      query: {
        /** The Game ID you want templates for */
        game_id: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ItemTemplate[], any>({
        path: `/templates`,
        method: 'GET',
        query: query,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create item template
     *
     * @tags root
     * @name TemplatesCreate
     * @summary Create item template
     * @request POST:/templates
     */
    templatesCreate: (request: HttpCreateItemTemplateRequest, params: RequestParams = {}) =>
      this.request<ItemTemplate, any>({
        path: `/templates`,
        method: 'POST',
        body: request,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get item template given an ID
     *
     * @tags root
     * @name TemplatesDetail
     * @summary Get item template
     * @request GET:/templates/{id}
     */
    templatesDetail: (id: string, params: RequestParams = {}) =>
      this.request<ItemTemplate, any>({
        path: `/templates/${id}`,
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  };
  types = {
    /**
     * @description List all types for a given Game ID
     *
     * @tags root
     * @name TypesList
     * @summary List item types
     * @request GET:/types
     */
    typesList: (
      query: {
        /** The Game ID you want types for */
        game_id: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ItemType[], any>({
        path: `/types`,
        method: 'GET',
        query: query,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  };
}
