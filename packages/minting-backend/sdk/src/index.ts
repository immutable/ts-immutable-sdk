import { ImmutableConfiguration, ModuleConfiguration } from '@imtbl/config';
import { BlockchainData } from '@imtbl/blockchain-data';
import { init } from '@imtbl/webhook';
import { mintingPersistence as mintingPersistencePg } from './persistence/pg/postgres';
import { mintingPersistence as mintingPersistencePrismaSqlite } from './persistence/prismaSqlite/sqlite';
import {
  submitMintingRequests, processMint, recordMint,
  MintRequestEvent
} from './minting';
import { CreateMintRequest, MintingPersistence } from './persistence/type';
import { Logger } from './logger/type';

export {
  submitMintingRequests, processMint, recordMint,
  // database clients
  mintingPersistencePg, mintingPersistencePrismaSqlite
};

export interface MintingBackendModuleConfiguration
  extends ModuleConfiguration<undefined> {
  persistence: MintingPersistence;
  logger?: Logger;
}

const noopHandlers = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  zkevmMintRequestUpdated: async (event: MintRequestEvent) => { },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  others: async (..._args: any) => { }
};

export class MintingBackendModule {
  private readonly baseConfig: ImmutableConfiguration;

  private readonly persistence: MintingPersistence;

  private readonly blockchainDataClient: BlockchainData;

  private readonly logger: Logger;

  constructor(config: MintingBackendModuleConfiguration) {
    this.baseConfig = config.baseConfig;
    this.persistence = config.persistence;
    this.logger = config.logger || console;
    this.blockchainDataClient = new BlockchainData({
      baseConfig: config.baseConfig
    });
  }

  async recordMint(mintRequest: CreateMintRequest) {
    await recordMint(this.persistence, mintRequest);
  }

  async submitMintingRequests(config: {
    defaultBatchSize?: number;
    chainName?: string;
    maxNumberOfTries?: number;
  }) {
    await submitMintingRequests(
      this.persistence,
      this.blockchainDataClient,
      config
    );
  }

  async processMint(body: string | Record<string, unknown>, otherHandlers = noopHandlers) {
    await init(body, this.baseConfig.environment, {
      zkevmMintRequestUpdated: async (event: MintRequestEvent) => {
        await processMint(this.persistence, event, this.logger);
        otherHandlers.zkevmMintRequestUpdated(event);
      },
      others: otherHandlers.others
    });
  }
}
