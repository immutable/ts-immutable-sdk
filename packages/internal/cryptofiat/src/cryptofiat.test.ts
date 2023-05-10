import { describe, expect } from '@jest/globals';
import { CryptoFiatConfiguration } from 'config';
import axios from 'axios';
import { CryptoFiat } from './cryptofiat';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CryptoFiat', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch symbols and cache them', async () => {
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

    const config = new CryptoFiatConfiguration({});
    const cryptoFiat = new CryptoFiat(config);
    await cryptoFiat.convert({ tokenSymbols: ['btc'] });
    await cryptoFiat.convert({ tokenSymbols: ['btc'] });

    expect(mockedAxios.get).toHaveBeenCalledTimes(3);
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      1,
      'https://api.coingecko.com/api/v3/coins/list',
    );
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      2,
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
    );
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      3,
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
    );
  });

  it('should fetch and convert token symbols to fiat', async () => {
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

    const config = new CryptoFiatConfiguration({});
    const cryptoFiat = new CryptoFiat(config);
    const result = await cryptoFiat.convert({ tokenSymbols: ['btc', 'eth'] });

    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      1,
      'https://api.coingecko.com/api/v3/coins/list',
    );
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      2,
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd',
    );
    expect(result.btc).toEqual({ usd: 50000 });
    expect(result.eth).toEqual({ usd: 4000 });
  });

  it('should fetch and convert token symbols to fiat symbols', async () => {
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

    const config = new CryptoFiatConfiguration({});
    const cryptoFiat = new CryptoFiat(config);
    const result = await cryptoFiat.convert({
      tokenSymbols: ['btc', 'eth'],
      fiatSymbols: ['AUD', 'usd'],
    });

    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      1,
      'https://api.coingecko.com/api/v3/coins/list',
    );
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      2,
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=aud,usd',
    );
    expect(result.btc).toEqual({ usd: 50000 });
    expect(result.eth).toEqual({ usd: 4000 });
  });

  it('should fetch and convert token symbols to fiat with api key', async () => {
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

    const apiKey = 'fake-api';
    const config = new CryptoFiatConfiguration({ apiKey });
    const cryptoFiat = new CryptoFiat(config);
    const result = await cryptoFiat.convert({ tokenSymbols: ['btc', 'eth'] });

    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      1,
      'https://pro-api.coingecko.com/api/v3/coins/list?x_cg_pro_api_key=fake-api',
    );
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      2,
      'https://pro-api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&x_cg_pro_api_key=fake-api',
    );
    expect(result.btc).toEqual({ usd: 50000 });
    expect(result.eth).toEqual({ usd: 4000 });
  });

  it('should throw an error when tokenSymbols is empty or not provided', async () => {
    const config = new CryptoFiatConfiguration({});
    const cryptoFiat = new CryptoFiat(config);

    await expect(cryptoFiat.convert({ tokenSymbols: [] })).rejects.toThrow(
      'Error missing token symbols to convert',
    );
  });

  it('should throw an error when fetching symbols fails', async () => {
    const mockedSymbolsResponse = {
      status: 400,
      statusText: 'Bad Request',
    };
    mockedAxios.get.mockResolvedValueOnce(mockedSymbolsResponse);

    const config = new CryptoFiatConfiguration({});
    const cryptoFiat = new CryptoFiat(config);
    await expect(
      cryptoFiat.convert({ tokenSymbols: ['btc', 'eth'] }),
    ).rejects.toThrow('Error fetching coin list: 400 Bad Request');
  });

  it('should throw an error when fetching prices fails', async () => {
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

    const config = new CryptoFiatConfiguration({});
    const cryptoFiat = new CryptoFiat(config);
    await expect(
      cryptoFiat.convert({ tokenSymbols: ['btc', 'eth'] }),
    ).rejects.toThrow('Error fetching prices: 400 Bad Request');
  });
});
