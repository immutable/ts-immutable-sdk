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

export interface InventoryBatchRequest {
  items?: InventoryBatchRequestItems;
}

export interface InventoryBatchRequestItems {
  create?: InventoryCreateItemRequest[];
  delete?: InventoryDeleteItemRequest[];
}

export interface InventoryCreateItemRequest {
  /**
   * @format uuid
   * @example "00000000-0000-0000-0000-000000000000"
   */
  item_definition_id: string;
  /**
   * Location of the item. Can be one of the following values:
   * * offchain - Off chain, only in the inventory system.
   * * starkex - On the StarkEx Network.
   * * zkevm - On the ZK EVM Network.
   */
  location: 'offchain' | 'zkevm' | 'starkex';
  /** JSON Object of item properties e.g. {"Level": 2, "Rarity": "Common"} */
  metadata?: object;
  /**
   * @format user_id,eth_address
   * @example "00000000-0000-0000-0000-000000000000,0x000000000000"
   */
  owner: string;
}

export interface InventoryDeleteItemRequest {
  /** @example "shardbound::item::00000000-0000-0000-0000-000000000000::2OJwAJu2EpNckUgT0cY09cfZfCk" */
  item_id: string;
}

export interface InventoryItem {
  /**
   * @format eth_address
   * @example "0x0000000000000000000000000000000000000000"
   */
  contract_id?: string;
  /**
   * @format date-time
   * @example "2023-04-05T00:00:00+00:00"
   */
  created_at?: string;
  /**
   * @format date-time
   * @example "2023-04-05T00:00:00+00:00"
   */
  deleted_at?: string;
  /** @example "shardbound" */
  game_id?: string;
  /**
   * @format resource_id
   * @example "shardbound::item::item_definition_1::0ujsszwN8NRY24YaXiTIE2VWDTS"
   */
  id?: string;
  /**
   * @format uuid
   * @example "00000000-0000-0000-0000-000000000000"
   */
  item_definition_id?: string;
  /**
   * @format date-time
   * @example "2023-04-05T00:00:00+00:00"
   */
  last_traded?: string;
  /**
   * Location of the item. Can be one of the following values:
   * * offchain - Off chain, only in the inventory system.
   * * starkex - On the StarkEx Network.
   * * zkevm - On the ZK EVM Network.
   * @example "offchain"
   */
  location?: string;
  /** JSON Object of item properties e.g. {"Level": 2, "Rarity": "Common"} */
  metadata?: object;
  /**
   * @format user_id,eth_address
   * @example "00000000-0000-0000-0000-000000000000,0x0000000000000000000000000000000000000000"
   */
  owner?: string;
  /**
   * Status of the item. Can be one of the following values:
   * * minted - The item has been minted and is in the inventory system.
   * * minting - The item has been requested to be minted
   * * pending - The item is pending to be minted.
   * * failed - The item failed to be minted.
   * * offchain - The item is off chain. No minting is required.
   * @example "U3dhZ2dlciByb2Nrcw=="
   */
  status?: string;
  /**
   * @format eth_address
   * @example "0x0000000000000000000000000000000000000000"
   */
  token_id?: string;
  /**
   * @format date-time
   * @example "2023-04-05T00:00:00+00:00"
   */
  updated_at?: string;
}

export interface InventoryMintItemRequest {
  item_id?: string[];
}

export interface InventoryPaginatedItems {
  direction?: string;
  limit?: number;
  page?: number;
  rows?: InventoryItem[];
  sort?: string;
  total_pages?: number;
  total_rows?: number;
}

export interface InventoryUpdateItemRequest {
  /** JSON Object of item properties e.g. {"Level": 2, "Rarity": "Common"} */
  metadata?: object;
  /**
   * Overwrite means the metadata will overwrite the existing metadata entirely.
   * @example false
   */
  overwrite?: boolean;
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
  public baseUrl: string = '/inventory/v1';
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
 * @title Inventory API
 * @version 1.0
 * @baseUrl /inventory/v1
 * @contact
 *
 * Inventory API
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  items = {
    /**
     * @description Get item by ID
     *
     * @tags root
     * @name ItemsDetail
     * @summary Get item by ID
     * @request GET:/items/{id}
     */
    itemsDetail: (id: string, params: RequestParams = {}) =>
      this.request<InventoryItem, any>({
        path: `/items/${id}`,
        method: 'GET',
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Update an item's metadata
     *
     * @tags root
     * @name ItemsUpdate
     * @summary Update an item
     * @request PUT:/items/{itemID}
     * @secure
     */
    itemsUpdate: (itemId: string, request: InventoryUpdateItemRequest, params: RequestParams = {}) =>
      this.request<InventoryItem, any>({
        path: `/items/${itemId}`,
        method: 'PUT',
        body: request,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  };
  gameId = {
    /**
     * @description An atomic operation that allow to create and delete multiple items
     *
     * @tags root
     * @name BatchCreate
     * @summary Create/Delete items in batch
     * @request POST:/{gameID}/batch
     * @secure
     */
    batchCreate: (gameId: string, request: InventoryBatchRequest, params: RequestParams = {}) =>
      this.request<InventoryItem[], any>({
        path: `/${gameId}/batch`,
        method: 'POST',
        body: request,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get items based on filters
     *
     * @tags root
     * @name ItemsDetail
     * @summary Get items
     * @request GET:/{gameID}/items
     */
    itemsDetail: (
      gameId: string,
      query?: {
        /** Item IDs to filter items */
        id?: string[];
        /** Owners to filter items */
        owner?: string[];
        /** Number of records per page */
        limit?: number;
        /** Page number */
        page?: number;
        /** field to order the results */
        order_by?: string;
        /** results ordered ascending or descending */
        direction?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<InventoryPaginatedItems, any>({
        path: `/${gameId}/items`,
        method: 'GET',
        query: query,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create an item for the given game, owner, location and item definition
     *
     * @tags root
     * @name ItemsCreate
     * @summary Create an item
     * @request POST:/{gameID}/items
     * @secure
     */
    itemsCreate: (gameId: string, request: InventoryCreateItemRequest, params: RequestParams = {}) =>
      this.request<InventoryItem, any>({
        path: `/${gameId}/items`,
        method: 'POST',
        body: request,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Delete an item for the given game
     *
     * @tags root
     * @name ItemsDelete
     * @summary Delete an item
     * @request DELETE:/{gameID}/items/{id}
     * @secure
     */
    itemsDelete: (gameId: string, id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/${gameId}/items/${id}`,
        method: 'DELETE',
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Used to mint items that aren't minted yet (pending status)
     *
     * @tags root
     * @name MintCreate
     * @summary Mint on-chain items in the zkEVM
     * @request POST:/{gameID}/mint
     * @secure
     */
    mintCreate: (gameId: string, request: InventoryMintItemRequest, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/${gameId}/mint`,
        method: 'POST',
        body: request,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
}
