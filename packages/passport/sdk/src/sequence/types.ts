export interface RequestArguments {
  method: string;
  params?: Array<any>;
}

export type Provider = {
  request: (request: RequestArguments) => Promise<any>;
  on: (event: string, listener: (...args: any[]) => void) => void;
  removeListener: (event: string, listener: (...args: any[]) => void) => void;
  isPassport: boolean;
};

export enum ProviderEvent {
  ACCOUNTS_CHANGED = 'accountsChanged',
  CHAIN_CHANGED = 'chainChanged',
}

export type AccountsChangedEvent = Array<string>;
export type ChainChangedEvent = string;

export interface ProviderEventMap extends Record<string, any> {
  [ProviderEvent.ACCOUNTS_CHANGED]: [AccountsChangedEvent];
  [ProviderEvent.CHAIN_CHANGED]: [ChainChangedEvent];
}
