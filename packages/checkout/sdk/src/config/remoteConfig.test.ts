import axios from 'axios';
import { Environment } from '@imtbl/config';
import { RemoteConfig } from './remoteConfig';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('RemoteConfig', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it(`should fetch configs and cache them [${Environment.PRODUCTION}]`, async () => {
    const mockResponse = {
      status: 200,
      data: {
        dex: {
          overrides: {
            rpcURL: 'https://test.com',
          },
        },
      },
    };
    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    const config = new RemoteConfig({ environment: Environment.PRODUCTION });
    await config.load();
    await config.load();

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      1,
      'https://checkout-api.immutable.com/v1/config',
    );
  });

  it(`should fetch configs and cache them [${Environment.SANDBOX}]`, async () => {
    const mockResponse = {
      status: 200,
      data: {
        dex: {
          overrides: {
            rpcURL: 'https://test.com',
          },
        },
      },
    };
    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    const config = new RemoteConfig({ environment: Environment.SANDBOX });
    await config.load();
    await config.load();

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      1,
      'https://checkout-api.sandbox.immutable.com/v1/config',
    );
  });
});
