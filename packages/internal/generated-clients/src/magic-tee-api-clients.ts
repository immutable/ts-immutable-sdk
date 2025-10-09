import axios from 'axios';
import { SignOperationsApi, WalletApi } from './magic-tee';

export type MagicTeeApiClientsConfig = {
  basePath: string;
  timeout: number;
  magicPublishableApiKey: string;
  magicProviderId: string;
};

export class MagicTeeApiClients {
  public signOperationsApi: SignOperationsApi;

  public walletApi: WalletApi;

  constructor(config: MagicTeeApiClientsConfig) {
    const instance = axios.create({
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Magic-API-Key': config.magicPublishableApiKey,
        'X-OIDC-Provider-ID': config.magicProviderId,
      },
    });

    this.signOperationsApi = new SignOperationsApi(undefined, config.basePath, instance);
    this.walletApi = new WalletApi(undefined, config.basePath, instance);
  }
}
