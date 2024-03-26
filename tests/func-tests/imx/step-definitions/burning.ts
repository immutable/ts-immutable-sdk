import {
  IMXClient,
  ImxModuleConfiguration,
  GenericIMXProvider,
  ProviderConfiguration,
  UnsignedTransferRequest,
} from '@imtbl/sdk/x';
import { configuration, StepSharedState } from './stepSharedState';

export class Burning {
  constructor(protected stepSharedState: StepSharedState) { }

  config: ImxModuleConfiguration = {
    baseConfig: { environment: configuration.environment },
  };

  providerConfig = new ProviderConfiguration({
    baseConfig: configuration,
  });

  client = new IMXClient(this.config);

  // @when(
  //   '{string} creates burn {string} of {string} NFT to burn address',
  //   undefined,
  //   20000,
  // )
  public async burnNFT(userVar: string, burnVar: string, assetVar: string) {
    const userWalletConnection = this.stepSharedState.users[userVar];
    const token = this.stepSharedState.nfts[assetVar];
    const burnAddress = '0x0000000000000000000000000000000000000000';

    const burnRequest: UnsignedTransferRequest = {
      tokenAddress: token.data.token_address,
      tokenId: token.data.id,
      type: 'ERC721',
      receiver: burnAddress,
    };
    const imxProvider = new GenericIMXProvider(
      this.providerConfig,
      userWalletConnection.ethSigner,
      userWalletConnection.starkSigner,
    );

    this.stepSharedState.burns[burnVar] = await imxProvider.transfer(
      burnRequest,
    );
  }
}
