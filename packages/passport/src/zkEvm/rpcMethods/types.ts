import { ExternalProvider, JsonRpcProvider } from '@ethersproject/providers';
import { PassportConfiguration } from '../../config';
import { ConfirmationScreen } from '../../confirmation';
import { RelayerAdapter } from '../relayerAdapter';
import { UserZkEvm } from '../../types';

export type EthMethodWithAuthParams = {
  magicProvider: ExternalProvider;
  jsonRpcProvider: JsonRpcProvider;
  config: PassportConfiguration;
  confirmationScreen: ConfirmationScreen;
  relayerAdapter: RelayerAdapter;
  user: UserZkEvm;
  params: any[];
};
