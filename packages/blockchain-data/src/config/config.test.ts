// import { Environment, ImmutableConfiguration } from '@imtbl/config';
// import { BlockchainData } from '../blockchain-data';
// import { BlockchainDataModuleConfiguration } from './index';

describe('BlockchainData', () => {
  it('should instantiate a SANDBOX BlockchainData', async () => {
    // const imtblConfig = new ImmutableConfiguration({
    //   environment: Environment.SANDBOX,
    // });
    // const client = new BlockchainData({
    //   baseConfig: imtblConfig,
    // });
    // const response = await client.listActivities({
    //   chainName: 'blah',
    // });
    // expect(response.status).toEqual(200);
    // expect(response.config.headers?.['x-sdk-version']).toContain(
    //   'ts-immutable-sdk'
    // );
  });

  it('should instantiate a PRODUCTION BlockchainData', async () => {
    // const imtblConfig = new ImmutableConfiguration({
    //   environment: Environment.PRODUCTION,
    // });
    // const client = new BlockchainData({
    //   baseConfig: imtblConfig,
    // });
    // const response = await client.listActivities({
    //   chainName: 'blah',
    // });
    // expect(assetsResponse.status).toEqual(200);
    // expect(assetsResponse.config.headers?.['x-sdk-version']).toContain(
    //   'ts-immutable-sdk'
    // );
  });

  it('should instantiate a BlockchainData with override and custom version', async () => {
    // const config: BlockchainDataModuleConfiguration = {
    //   baseConfig: { environment: Environment.PRODUCTION },
    //   overrides: {
    //     basePath: 'https://indexer-mr.dev.imtbl.com/v1',
    //   },
    // };
    // const client = new BlockchainData(config);
    // const response = await client.listActivities({
    //   chainName: 'blah',
    // });
    // expect(assetsResponse.status).toEqual(200);
  });

  it('should instantiate a BlockchainData with override and custom SDK version', async () => {
    // const sdkVersion = 'ts-immutable-sdk-0.0.1';
    // const config: BlockchainDataModuleConfiguration = {
    //   baseConfig: { environment: Environment.PRODUCTION },
    //   overrides: {
    //     basePath: 'https://indexer-mr.dev.imtbl.com/v1',
    //     headers: {
    //       sdkVersion,
    //     },
    //   },
    // };
    // const client = new BlockchainData(config);
    // const response = await client.listActivities({
    //   chainName: 'blah',
    // });
    // expect(assetsResponse.status).toEqual(200);
    // expect(assetsResponse.config.headers?.['x-sdk-version']).toEqual(
    //   sdkVersion
    // );
  });
});
