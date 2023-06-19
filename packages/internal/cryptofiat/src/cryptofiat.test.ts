import { describe, expect } from '@jest/globals';
import { CryptoFiatConfiguration } from 'config';
import axios from 'axios';
import { Environment } from '@imtbl/config';
import { CryptoFiat } from './cryptofiat';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const config = new CryptoFiatConfiguration({
  baseConfig: {
    environment: Environment.PRODUCTION,
  },
});

describe('CryptoFiat', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Utility function to test the success case for a given environment
  const success = async (conf: CryptoFiatConfiguration, base: string) => {
    const mockedOverridesResponse = {
      status: 200,
      data: {
        eth: 'ethereum',
        imx: 'immutable-x',
      },
    };
    mockedAxios.get.mockResolvedValueOnce(mockedOverridesResponse);

    const mockedSymbolsResponse = {
      status: 200,
      data: [
        { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
        { id: 'ethereum', symbol: 'eth', name: 'Ethereum' },
      ],
    };
    mockedAxios.get.mockResolvedValueOnce(mockedSymbolsResponse);

    const mockedConversionResponse = {
      status: 200,
      data: {
        bitcoin: { usd: 50000 },
        ethereum: { usd: 4000 },
      },
    };
    mockedAxios.get.mockResolvedValue(mockedConversionResponse);

    const cryptoFiat = new CryptoFiat(conf);
    await cryptoFiat.convert({ tokenSymbols: ['btc'] });
    await cryptoFiat.convert({ tokenSymbols: ['btc'] });

    expect(mockedAxios.get).toHaveBeenCalledTimes(4);
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      1,
      `${base}/v1/fiat/coins/overrides`,
    );
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      2,
      `${base}/v1/fiat/coins/all`,
    );
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      3,
      `${base}/v1/fiat/conversion?ids=bitcoin&currencies=usd`,
    );
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      4,
      `${base}/v1/fiat/conversion?ids=bitcoin&currencies=usd`,
    );
  };

  it(
    `should fetch symbols and overrides and cache them [${Environment.SANDBOX}]]`,
    async () => {
      const conf = new CryptoFiatConfiguration({
        baseConfig: {
          environment: Environment.SANDBOX,
        },
      });
      success(conf, 'https://checkout-api.dev.immutable.com');
    },
  );

  it(
    `should fetch symbols and overrides and cache them [${Environment.PRODUCTION}]]`,
    async () => success(config, 'https://checkout-api.sandbox.immutable.com'),
  );

  it('should fetch and convert token symbols to fiat', async () => {
    const mockedOverridesResponse = {
      status: 200,
      data: {
        eth: 'ethereum',
        imx: 'immutable-x',
      },
    };
    mockedAxios.get.mockResolvedValueOnce(mockedOverridesResponse);

    const mockedSymbolsResponse = {
      status: 200,
      data: [
        { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
        { id: 'ethereum', symbol: 'eth', name: 'Ethereum' },
      ],
    };
    mockedAxios.get.mockResolvedValueOnce(mockedSymbolsResponse);

    const mockedConversionResponse = {
      status: 200,
      data: {
        bitcoin: { usd: 50000 },
        ethereum: { usd: 4000 },
      },
    };
    mockedAxios.get.mockResolvedValueOnce(mockedConversionResponse);

    const cryptoFiat = new CryptoFiat(config);
    const result = await cryptoFiat.convert({ tokenSymbols: ['btc', 'eth'] });

    expect(mockedAxios.get).toHaveBeenCalledTimes(3);
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      1,
      'https://checkout-api.sandbox.immutable.com/v1/fiat/coins/overrides',
    );
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      2,
      'https://checkout-api.sandbox.immutable.com/v1/fiat/coins/all',
    );
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      3,
      'https://checkout-api.sandbox.immutable.com/v1/fiat/conversion?ids=bitcoin,ethereum&currencies=usd',
    );
    expect(result.btc).toEqual({ usd: 50000 });
    expect(result.eth).toEqual({ usd: 4000 });
  });

  it('should fetch and convert token symbols to fiat using the overrides', async () => {
    const mockedOverridesResponse = {
      status: 200,
      data: {
        eth: 'ethereum',
        imx: 'immutable-x',
      },
    };
    mockedAxios.get.mockResolvedValueOnce(mockedOverridesResponse);

    const mockedSymbolsResponse = {
      status: 200,
      data: [
        { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
        { id: 'ethereum-wormhole', symbol: 'eth', name: 'Ethereum' },
        { id: 'usd-coin', symbol: 'usdc', name: 'USDC' },
      ],
    };
    mockedAxios.get.mockResolvedValueOnce(mockedSymbolsResponse);

    const mockedConversionResponse = {
      status: 200,
      data: {
        bitcoin: { usd: 50000 },
        ethereum: { usd: 4000 },
        'usd-coin': { usd: 10000 },
      },
    };
    mockedAxios.get.mockResolvedValueOnce(mockedConversionResponse);

    const cryptoFiat = new CryptoFiat(config);
    const result = await cryptoFiat.convert({ tokenSymbols: ['eth', 'usdc'] });

    expect(mockedAxios.get).toHaveBeenCalledTimes(3);
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      1,
      'https://checkout-api.sandbox.immutable.com/v1/fiat/coins/overrides',
    );
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      2,
      'https://checkout-api.sandbox.immutable.com/v1/fiat/coins/all',
    );
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      3,
      'https://checkout-api.sandbox.immutable.com/v1/fiat/conversion?ids=ethereum,usd-coin&currencies=usd',
    );
    expect(result.usdc).toEqual({ usd: 10000 });
    expect(result.eth).toEqual({ usd: 4000 });
  });

  it('should fetch and convert token symbols to fiat symbols', async () => {
    const mockedOverridesResponse = {
      status: 200,
      data: {
        eth: 'ethereum',
        imx: 'immutable-x',
      },
    };
    mockedAxios.get.mockResolvedValueOnce(mockedOverridesResponse);

    const mockedSymbolsResponse = {
      status: 200,
      data: [
        { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
        { id: 'ethereum', symbol: 'eth', name: 'Ethereum' },
      ],
    };
    mockedAxios.get.mockResolvedValueOnce(mockedSymbolsResponse);

    const mockedConversionResponse = {
      status: 200,
      data: {
        bitcoin: { usd: 50000 },
        ethereum: { usd: 4000 },
      },
    };
    mockedAxios.get.mockResolvedValueOnce(mockedConversionResponse);

    const cryptoFiat = new CryptoFiat(config);
    const result = await cryptoFiat.convert({
      tokenSymbols: ['btc', 'eth'],
      fiatSymbols: ['AUD', 'usd'],
    });

    expect(mockedAxios.get).toHaveBeenCalledTimes(3);
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      1,
      'https://checkout-api.sandbox.immutable.com/v1/fiat/coins/overrides',
    );
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      2,
      'https://checkout-api.sandbox.immutable.com/v1/fiat/coins/all',
    );
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      3,
      'https://checkout-api.sandbox.immutable.com/v1/fiat/conversion?ids=bitcoin,ethereum&currencies=aud,usd',
    );
    expect(result.btc).toEqual({ usd: 50000 });
    expect(result.eth).toEqual({ usd: 4000 });
  });

  it('should throw an error when tokenSymbols is empty or not provided', async () => {
    const cryptoFiat = new CryptoFiat(config);

    await expect(cryptoFiat.convert({ tokenSymbols: [] })).rejects.toThrow(
      'Error missing token symbols to convert',
    );
  });

  it('should throw an error when fetching overrides fails', async () => {
    const mockedSymbolsResponse = {
      status: 400,
      statusText: 'Bad Request',
    };
    mockedAxios.get.mockResolvedValueOnce(mockedSymbolsResponse);

    const cryptoFiat = new CryptoFiat(config);
    await expect(
      cryptoFiat.convert({ tokenSymbols: ['btc', 'eth'] }),
    ).rejects.toThrow('Error fetching coins overrides: 400 Bad Request');
  });

  it('should throw an error when fetching symbols fails', async () => {
    const mockedOverridesResponse = {
      status: 200,
      data: {
        eth: 'ethereum',
        imx: 'immutable-x',
      },
    };
    mockedAxios.get.mockResolvedValueOnce(mockedOverridesResponse);

    const mockedSymbolsResponse = {
      status: 400,
      statusText: 'Bad Request',
    };
    mockedAxios.get.mockResolvedValueOnce(mockedSymbolsResponse);

    const cryptoFiat = new CryptoFiat(config);
    await expect(
      cryptoFiat.convert({ tokenSymbols: ['btc', 'eth'] }),
    ).rejects.toThrow('Error fetching coins list: 400 Bad Request');
  });

  it('should throw an error when fetching prices fails', async () => {
    const mockedOverridesResponse = {
      status: 200,
      data: {
        eth: 'ethereum',
        imx: 'immutable-x',
      },
    };
    mockedAxios.get.mockResolvedValueOnce(mockedOverridesResponse);

    const mockedSymbolsResponse = {
      status: 200,
      data: [
        { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
        { id: 'ethereum', symbol: 'eth', name: 'Ethereum' },
      ],
    };
    mockedAxios.get.mockResolvedValueOnce(mockedSymbolsResponse);

    const mockedConversionResponse = {
      status: 400,
      statusText: 'Bad Request',
    };
    mockedAxios.get.mockResolvedValueOnce(mockedConversionResponse);

    const cryptoFiat = new CryptoFiat(config);
    await expect(
      cryptoFiat.convert({ tokenSymbols: ['btc', 'eth'] }),
    ).rejects.toThrow('Error fetching prices: 400 Bad Request');
  });
});
