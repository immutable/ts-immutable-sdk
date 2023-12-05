import { ImmutableX, UnsignedTransferRequest } from '@imtbl/core-sdk';
import { configuration, StepSharedState } from './stepSharedState';
import { ImmutableXClient, ImxClientModuleConfiguration } from '@imtbl/sdk/immutablex_client';
import { GenericIMXProvider, ProviderConfiguration } from '@imtbl/sdk/provider';

// @binding([StepSharedState])
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
    const provider = new GenericIMXProvider(this.providerConfig, userWalletConnection.ethSigner, userWalletConnection.starkSigner);

    this.stepSharedState.burns[burnVar] = await provider.transfer(burnRequest);
  }
}
