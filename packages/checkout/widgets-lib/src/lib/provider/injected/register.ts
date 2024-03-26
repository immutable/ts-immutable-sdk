import { EIP1193Provider } from '../types/eip1193';

export interface Register {}

export type DefaultRegister = {
  /** The EIP-1193 Provider. */
  provider: EIP1193Provider;
  /** Reverse Domain Name Notation (rDNS) of the Wallet Provider. */
  rdns: 'com.coinbase' | 'com.enkrypt' | 'io.metamask' | 'io.zerion';
};

export type ResolvedRegister = {
  /** The EIP-1193 Provider. */
  provider: Register extends {
    provider: infer provider extends DefaultRegister['provider']
  }
    ? provider
    : DefaultRegister['provider'];
  /** Reverse Domain Name Notation (rDNS) of the Wallet Provider. */
  rdns: Register extends { rdns: infer rdns extends string }
    ? rdns
    : DefaultRegister['rdns'] | (string & {}); // loose autocomplete
};

export type Rdns = ResolvedRegister['rdns'];
