/* eslint @typescript-eslint/naming-convention: off */

import axios from 'axios';
import { Environment } from '@imtbl/config';
import { getCryptoToUSDConversion, TokenPriceResponse } from './CryptoFiat';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const conversionsMap = new Map<string, number>();

const mockResponse: TokenPriceResponse = {
  result: [
    {
      symbol: 'WOMBAT',
      token_address: '0x0219d987a75f860e55d936646c60ba9a021e52ac',
      usd_price: '0.0001359733469',
    },
    {
      symbol: 'BZAI',
      token_address: '0x0bbb2db8d777c72516a344506fa2130040b48c13',
      usd_price: '0.03',
    },
    {
      symbol: 'WIMX',
      token_address: '0x3a0c2ba54d6cbd3121f01b96dfd20e99d1696c9d',
      usd_price: '0.89',
    },
  ],
};

describe('getCryptoToUSDConversion', () => {
  beforeEach(() => {
    conversionsMap.set('wombat', 0.0001359733469);
    conversionsMap.set('bzai', 0.03);
    conversionsMap.set('wimx', 0.89);
    conversionsMap.set('imx', 0.89);
  });

  afterEach(() => {
    conversionsMap.clear();
    jest.clearAllMocks();
  });

  it('should return the correct conversion for all tokens', async () => {
    mockedAxios.get.mockResolvedValue({ data: mockResponse });

    const conversions = await getCryptoToUSDConversion(Environment.SANDBOX);
    expect(conversions.size).toEqual(4);
    expect(conversions).toEqual(conversionsMap);
  });

  it('adds IMX to the conversions map', async () => {
    mockedAxios.get.mockResolvedValue({ data: mockResponse });

    const conversions = await getCryptoToUSDConversion(Environment.SANDBOX);
    expect(conversions.get('imx')).toEqual(0.89);
  });
});
