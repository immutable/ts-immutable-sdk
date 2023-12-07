import { UnsignedTransferRequest } from '@imtbl/core-sdk';
import { ImmutableXClient, ImxClientModuleConfiguration } from '@imtbl/sdk/immutablex_client';
import { GenericIMXProvider, ProviderConfiguration } from '@imtbl/sdk/provider';
import { configuration, StepSharedState } from './stepSharedState';

export class Burning {
  constructor(protected stepSharedState: StepSharedState) {}

  config: ImxClientModuleConfiguration = {
    baseConfig: { environment: configuration.environment },
  };

  providerConfig = new ProviderConfiguration({
    baseConfig: configuration,
  });

  client = new ImmutableXClient(this.config);

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
    const imxProvider = new GenericIMXProvider(this.providerConfig, userWalletConnection.ethSigner, userWalletConnection.starkSigner);

    this.stepSharedState.burns[burnVar] = await imxProvider.transfer(burnRequest);
  }
}
