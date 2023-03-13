import { ImmutableXConfiguration, UsersApi, WalletConnection } from '@imtbl/core-sdk';
import { Signer } from '@ethersproject/abstract-signer';
import { registerPassportWorkflow } from './registeration';

export class Workflows {
  private readonly usersApi: UsersApi;

  private isChainValid(chainID: number) {
    return chainID === this.config.ethConfiguration.chainID;
  }

  constructor(protected config: ImmutableXConfiguration) {
    const { apiConfiguration } = config;

    this.config = config;
    this.usersApi = new UsersApi(apiConfiguration);
  }

  private async validateChain(signer: Signer) {
    const chainID = await signer.getChainId();

    if (!this.isChainValid(chainID))
      throw new Error(
        'The wallet used for this operation is not from the correct network.',
      );
  }

  public async registerPassport(walletConnection: WalletConnection, authorization: string) {
    await this.validateChain(walletConnection.ethSigner);

    return registerPassportWorkflow({
      ...walletConnection,
      usersApi: this.usersApi,
    }, authorization);
  }
}



