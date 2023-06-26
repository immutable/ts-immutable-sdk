import { ExternalProvider, JsonRpcProvider } from '@ethersproject/providers';
import { PassportConfiguration } from '../../config';
import { ConfirmationScreen } from '../../confirmation';
import { RelayerAdapter } from '../relayerAdapter';
import { UserWithEtherKey } from '../../types';

export type EthMethodParams = {
  jsonRpcProvider: JsonRpcProvider;
  config: PassportConfiguration;
  params: any[];
};

export type EthMethodWithAuthParams = EthMethodParams & {
  magicProvider: ExternalProvider;
  confirmationScreen: ConfirmationScreen;
  relayerAdapter: RelayerAdapter;
  user: UserWithEtherKey;
};

export type EthMethod = (params: EthMethodParams) => Promise<any>;
export type EthMethodWithAuth = (params: EthMethodWithAuthParams) => Promise<any>;
