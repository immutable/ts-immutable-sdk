import { passport } from '@imtbl/sdk';
import { SwitchChainError, getAddress } from 'viem';
import {
  ChainNotConfiguredError, createConnector, normalizeChainId, CreateConnectorFn,
} from '@wagmi/core';

export function PassportConnector(pp: passport.Passport): CreateConnectorFn {
  type Properties = {};

  return createConnector<passport.Provider, Properties>((config) => ({
    id: 'immutable-passport',
    name: 'Immutable Passport',
    type: 'Immutable Passport',

    async setup() {
      const provider = await this.getProvider();
      provider.on('accountsChanged', this.onAccountsChanged);
      provider.on('chainChanged', this.onChainChanged);
      provider.on('disconnect', this.onDisconnect);
    },
    async connect() {
      return {
        accounts: await this.getAccounts(),
        chainId: await this.getChainId(),
      };
    },
    async disconnect() {
      // TODO: is this implemented
    },
    async getAccounts() {
      const provider = await this.getProvider();
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      return (accounts as Array<string>).map((x) => getAddress(x));
    },
    async getProvider() {
      return pp.connectEvm();
    },
    async isAuthorized() {
      // TODO: does this work? Won't this just pop up the login window (may not be intended)
      try {
        const account = await this.getAccounts();
        return !!account;
      } catch (e) {
        return false;
      }
    },
    async switchChain() {
      // Passport currently doesn't support changing chains
      throw new SwitchChainError(new ChainNotConfiguredError());
    },
    async getChainId() {
      const provider = await this.getProvider();
      const chainId = await provider.request({ method: 'eth_chainId' });
      return normalizeChainId(chainId);
    },
    async onAccountsChanged() {
      // Passport currently doesn't support changing accounts
      // TODO: throw an error?
    },
    async onChainChanged() {
      // Passport currently doesn't support changing chains
      // TODO: throw an error?
    },
    async onConnect() {
      // TODO: anything?
    },
    async onDisconnect() {
      config.emitter.emit('disconnect');
    },
  }));
}
