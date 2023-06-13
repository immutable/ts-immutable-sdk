import { Environment } from '@imtbl/config';
import { ImmutableXClient } from '../index';
import { ImxConfiguration, ImxModuleConfiguration, createImmutableXConfiguration } from '../config';

describe('formatError', () => {
  it('should format api errors to IMXError', async () => {
    const client = new ImmutableXClient(new ImxConfiguration({
      baseConfig: {
        environment: Environment.SANDBOX,
      },
    }));
    await expect(
      client.getAsset({
        tokenAddress: '0',
        tokenId: '0',
      }),
    ).rejects.toThrowError("Asset with address 0 and id '0' not found");
  });

  it('should format axios errors to IMXError', async () => {
    const client = new ImmutableXClient(new ImxConfiguration({
      baseConfig: {
        environment: Environment.SANDBOX,
      },
    }));
    await expect(client.getUser('')).rejects.toThrowError(
      'Error: Request failed with status code 405',
    );
  });

  it('should format 404 errors to IMXError', async () => {
    const config: ImxModuleConfiguration = {
      baseConfig: { environment: Environment.PRODUCTION },
      overrides: {
        immutableXConfig: createImmutableXConfiguration({
          basePath: 'https://api.sandbox.x.immutable.com/test404',
          chainID: 1,
          coreContractAddress: '',
          registrationContractAddress:
            '',
        }),
      },
    };
    const client = new ImmutableXClient(config);
    await expect(client.getUser('')).rejects.toThrowError(
      'Error: Request failed with status code 404',
    );
  });
});
