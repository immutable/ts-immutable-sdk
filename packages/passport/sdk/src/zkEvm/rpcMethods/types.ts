import { ExternalProvider, JsonRpcProvider } from '@ethersproject/providers';
import { PassportConfiguration } from '../../config';
import { RelayerClient } from '../relayerClient';
import { UserZkEvm } from '../../types';

export type EthMethodWithAuthParams = {
  magicProvider: ExternalProvider;
  jsonRpcProvider: JsonRpcProvider;
  config: PassportConfiguration;
  relayerClient: RelayerClient;
  user: UserZkEvm;
  params: Array<any>;
};
