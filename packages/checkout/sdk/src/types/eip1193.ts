import { Address } from '@imtbl/bridge-sdk';

export interface EIP1193Provider extends BaseEIP1193Provider,
  PassportEIP1193Provider,
  MetaMaskEIP1193Provider,
  WalletConnectEIP1193Provider {}

export interface BaseEIP1193Provider {
  request(args: EIP1193RequestArguments): Promise<unknown>;
  on<TEvent extends keyof EIP1193EventMap>(event: TEvent, listener: EIP1193EventMap[TEvent]): void;
  removeListener<TEvent extends keyof EIP1193EventMap>(event: TEvent, listener: EIP1193EventMap[TEvent]): void;
}

export interface PassportEIP1193Provider {
  isPassport?: boolean;
}

export interface MetaMaskEIP1193Provider {
  isMetaMask?: boolean;
}

export interface WalletConnectEIP1193Provider {
  isWalletConnect?: boolean;
}

interface EIP1193RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
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
