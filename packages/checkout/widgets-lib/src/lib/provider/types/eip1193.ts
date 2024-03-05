import { Address } from '@imtbl/bridge-sdk';
import { Prettify } from './utils';

/* eslint-disable @typescript-eslint/naming-convention */

export type EIP1474Methods = [];

export interface EIP1193Provider {
  request: EIP1193RequestFn<EIP1474Methods>;
  on<TEvent extends keyof EIP1193EventMap>(event: TEvent, listener: EIP1193EventMap[TEvent]): void;
  removeListener<TEvent extends keyof EIP1193EventMap>(event: TEvent, listener: EIP1193EventMap[TEvent]): void;
}

/**
 * Errors
 */

export class ProviderRpcError extends Error {
  code: number;

  details: string;

  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.details = message;
  }
}

/**
 *  Provider Events
 */

export type ProviderConnectInfo = {
  chainId: string
};

export type ProviderMessage = {
  type: string
  data: unknown
};

export type EIP1193EventMap = {
  accountsChanged(accounts: Address[]): void
  chainChanged(chainId: string): void
  connect(connectInfo: ProviderConnectInfo): void
  disconnect(error: ProviderRpcError): void
  message(message: ProviderMessage): void
};

/**
 * Utils
 */

export type RpcSchema = readonly {
  Method: string
  Parameters?: unknown
  ReturnType: unknown
}[];

export type RpcSchemaOverride = Omit<RpcSchema[number], 'Method'>;

export type EIP1193Parameters<
  TRpcSchema extends RpcSchema | undefined = undefined,
> = TRpcSchema extends RpcSchema
  ? {
    [K in keyof TRpcSchema]: Prettify<{
      method: TRpcSchema[K] extends TRpcSchema[number]
        ? TRpcSchema[K]['Method']
        : never
    } & (TRpcSchema[K] extends TRpcSchema[number]
      ? TRpcSchema[K]['Parameters'] extends undefined
        ? { params?: never }
        : { params: TRpcSchema[K]['Parameters'] }
      : never)
    >
  }[number]
  : {
    method: string
    params?: unknown
  };

export type EIP1193RequestOptions = {
  // The base delay (in ms) between retries.
  retryDelay?: number
  // The max number of times to retry.
  retryCount?: number
};

type DerivedRpcSchema<
  TRpcSchema extends RpcSchema | undefined,
  TRpcSchemaOverride extends RpcSchemaOverride | undefined,
> = TRpcSchemaOverride extends RpcSchemaOverride
  ? [TRpcSchemaOverride & { Method: string }]
  : TRpcSchema;

export type EIP1193RequestFn<
  TRpcSchema extends RpcSchema | undefined = undefined,
> = <
  TRpcSchemaOverride extends RpcSchemaOverride | undefined = undefined,
  TParameters extends EIP1193Parameters<DerivedRpcSchema<TRpcSchema, TRpcSchemaOverride>
  > = EIP1193Parameters<DerivedRpcSchema<TRpcSchema, TRpcSchemaOverride>>,
  _ReturnType = DerivedRpcSchema<
  TRpcSchema,
  TRpcSchemaOverride
  > extends RpcSchema
    ? Extract<
    DerivedRpcSchema<TRpcSchema, TRpcSchemaOverride>[number],
    { Method: TParameters['method'] }
    >['ReturnType']
    : unknown,
>(
  args: TParameters,
  options?: EIP1193RequestOptions,
) => Promise<_ReturnType>;
