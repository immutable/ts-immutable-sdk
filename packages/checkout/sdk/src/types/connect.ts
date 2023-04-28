import { Web3Provider } from '@ethersproject/providers';
import { NetworkInfo } from '../types';

export enum ConnectionProviders {
  METAMASK = 'metamask',
}

export interface ConnectParams {
  providerPreference: ConnectionProviders;
}

export interface ConnectResult {
  provider: Web3Provider;
  network: NetworkInfo;
}

export interface CheckConnectionParams {
  providerPreference: ConnectionProviders;
}

export interface CheckConnectionResult {
  isConnected: boolean;
  walletAddress: string;
}
