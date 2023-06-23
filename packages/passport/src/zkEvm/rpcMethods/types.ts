import { ExternalProvider, JsonRpcProvider } from '@ethersproject/providers';
import { PassportConfiguration } from '../../config';
import { ConfirmationScreen } from '../../confirmation';
import { RelayerAdapter } from '../relayerAdapter';
import { UserWithEtherKey } from '../../types';

export type EthMethodWithAuthParams = {
  magicProvider: ExternalProvider;
  jsonRpcProvider: JsonRpcProvider;
  config: PassportConfiguration;
  confirmationScreen: ConfirmationScreen;
  relayerAdapter: RelayerAdapter;
  user: UserWithEtherKey;
  params: any[];
};
