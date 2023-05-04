import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { Bridge } from 'bridge';
import { BridgeConfiguration } from 'config';
import { ETH_SEPOLIA_TO_ZKEVM_DEVNET } from 'constants/bridges';

describe('Constructing Bridge', () => {
  it('Works correctly', async () => {
    const bridgeConfig = new BridgeConfiguration({
      baseConfig: new ImmutableConfiguration({
        environment: Environment.SANDBOX,
      }),
      bridgeInstance: ETH_SEPOLIA_TO_ZKEVM_DEVNET,
    });
    new Bridge(bridgeConfig);
  });
});
