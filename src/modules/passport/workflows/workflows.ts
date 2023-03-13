import { Configuration, UsersApi, WalletConnection } from '@imtbl/core-sdk';
import { registerPassportWorkflow } from './registration';

export default class Workflows {
  private readonly usersApi: UsersApi;

  constructor(protected config: Configuration) {
    this.usersApi = new UsersApi(config);
  }

  public async registerPassport(walletConnection: WalletConnection, authorization: string) {
    return registerPassportWorkflow({
      ...walletConnection,
      usersApi: this.usersApi,
    }, authorization);
  }
}
