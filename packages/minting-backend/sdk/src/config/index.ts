/* eslint-disable implicit-arrow-linebreak */
import {
  ImmutableConfiguration,
  ModuleConfiguration
} from '@imtbl/config';

import {
  BlockchainData,
  BlockchainDataModuleConfiguration
} from '@imtbl/blockchain-data';

import { MintingPersistence } from '../persistence/type';

export interface MintingBackendModuleParams { }

export interface MintingBackendModuleConfiguration
  extends ModuleConfiguration<MintingBackendModuleParams> {
  persistence: MintingPersistence;
  blockchainDataModuleConfiguration: BlockchainDataModuleConfiguration;
}

export class MintingBackendConfiguration {
  readonly baseConfig: ImmutableConfiguration;

  readonly blockChainDataClient: BlockchainData;

  readonly persistence: MintingPersistence;

  constructor({ baseConfig, blockchainDataModuleConfiguration, persistence }: MintingBackendModuleConfiguration) {
    this.baseConfig = baseConfig;
    this.blockChainDataClient = new BlockchainData(blockchainDataModuleConfiguration);
    this.persistence = persistence;
  }
}
