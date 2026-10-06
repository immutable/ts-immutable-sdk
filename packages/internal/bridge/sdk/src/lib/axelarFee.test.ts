import axios from 'axios';
import { FeeData } from 'ethers';
import { BridgeError, BridgeErrorType } from '../errors';
import {
  AxelarFeeParams,
  estimateFallbackAxelarFee,
  getAxelarFeeWithFallback,
} from './axelarFee';

jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

const gwei = (value: number) => BigInt(Math.round(value * 1e9));

const feeData = (gasPrice: bigint) => ({
  gasPrice,
  maxFeePerGas: null,
  maxPriorityFeePerGas: null,
} as unknown as FeeData);

const ETHEREUM = { id: 'ethereum', symbol: 'ETH' };
const IMMUTABLE = { id: 'immutable', symbol: 'IMX' };

// Mainnet quotes from the Axelar GMP API on 2026-10-07 (gasLimit 250000, minGasPrice 1 gwei).
const AXELAR_QUOTES = {
  withdraw: {
    totalFee: BigInt('8901890674475210000'), // 8.90 IMX
    destinationGasPrice: gwei(1.205559871),
    prices: { ethereum: { usd: 2697.48 }, 'immutable-x': { usd: 0.187762 } },
  },
  deposit: {
    totalFee: BigInt('5405031339459'), // 0.0000054 ETH
    destinationGasPrice: gwei(11.000000049),
    prices: { ethereum: { usd: 2697.48 }, 'immutable-x': { usd: 0.187762 } },
  },
};

const withdrawParams = (overrides: Partial<AxelarFeeParams> = {}): AxelarFeeParams => ({
  axelarAPIEndpoint: 'https://api.gmp.axelarscan.io',
  priceAPIEndpoint: 'https://checkout-api.immutable.com',
  sourceAxelar: IMMUTABLE,
  destinationAxelar: ETHEREUM,
  destinationChainGasLimit: 250000,
  gasMultiplier: 'auto',
  getDestinationFeeData: async () => feeData(AXELAR_QUOTES.withdraw.destinationGasPrice),
  ...overrides,
});

const depositParams = (overrides: Partial<AxelarFeeParams> = {}): AxelarFeeParams => ({
  ...withdrawParams(),
  sourceAxelar: ETHEREUM,
  destinationAxelar: IMMUTABLE,
  getDestinationFeeData: async () => feeData(AXELAR_QUOTES.deposit.destinationGasPrice),
  ...overrides,
});

// The browser reports a request rejected by CORS as an axios network error without a response.
const corsError = () => Object.assign(new Error('Network Error'), { code: 'ERR_NETWORK' });

describe('axelarFee', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetAllMocks();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockedAxios.get.mockResolvedValue({ data: AXELAR_QUOTES.withdraw.prices });
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  describe('getAxelarFeeWithFallback', () => {
    it('returns the Axelar API fee when the API responds', async () => {
      mockedAxios.post.mockResolvedValue({ data: '8901890674475210000' });

      const result = await getAxelarFeeWithFallback(withdrawParams());

      expect(result).toEqual({ fee: BigInt('8901890674475210000'), source: 'axelar' });
      expect(mockedAxios.get).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('sends the existing estimateGasFee request with a timeout', async () => {
      mockedAxios.post.mockResolvedValue({ data: '1' });

      await getAxelarFeeWithFallback(withdrawParams({ gasMultiplier: 1.1 }));

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.gmp.axelarscan.io',
        {
          method: 'estimateGasFee',
          sourceChain: 'immutable',
          destinationChain: 'ethereum',
          symbol: 'IMX',
          gasLimit: 250000,
          gasMultiplier: 1.1,
          minGasPrice: 1000000000,
        },
        { timeout: 5000 },
      );
    });

    it.each([
      ['a network or CORS error', corsError(), 'network error, possibly CORS (Network Error)'],
      ['a timeout', Object.assign(new Error('timeout'), { code: 'ECONNABORTED' }), 'timeout'],
      [
        'a Cloudflare challenge',
        Object.assign(new Error('403'), { response: { status: 403, data: '<!DOCTYPE html>' } }),
        'HTTP 403',
      ],
      [
        'a rate limit',
        Object.assign(new Error('429'), { response: { status: 429, data: { error: true, message: 'slow down' } } }),
        'HTTP 429',
      ],
      [
        'a server error',
        Object.assign(new Error('502'), { response: { status: 502, data: 'Bad Gateway' } }),
        'HTTP 502',
      ],
    ])('falls back on %s and logs the reason', async (_, error, reason) => {
      mockedAxios.post.mockRejectedValue(error);

      const result = await getAxelarFeeWithFallback(withdrawParams());

      expect(result.source).toBe('fallback');
      expect(result.fee).toBeGreaterThan(BigInt(0));
      expect(warnSpy).toHaveBeenCalledWith(
        '[imtbl-bridge] Axelar fee API unavailable, using fallback estimate',
        expect.objectContaining({ reason, sourceChain: 'immutable', destinationChain: 'ethereum' }),
      );
    });

    it.each([
      ['an Axelar error body', { data: { error: true, message: 'bad chain' } }, 'bad chain'],
      ['a non-numeric body', { data: 'not a fee' }, 'unexpected response body'],
      ['an empty body', { data: undefined }, 'unexpected response body'],
    ])('throws AXELAR_GAS_ESTIMATE_FAILED without falling back on %s', async (_, response, message) => {
      mockedAxios.post.mockResolvedValue(response);

      const promise = getAxelarFeeWithFallback(withdrawParams());

      await expect(promise).rejects.toMatchObject({
        type: BridgeErrorType.AXELAR_GAS_ESTIMATE_FAILED,
        message: expect.stringContaining(message),
      });
      expect(mockedAxios.get).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it.each([
      ['with an Axelar error body', { status: 400, data: { error: true, message: 'invalid gas limit' } }, 'invalid gas limit'],
      ['without an Axelar error body', { status: 404, data: 'Not Found' }, 'HTTP 404'],
    ])('throws AXELAR_GAS_ESTIMATE_FAILED without falling back on a 4xx %s', async (_, response, message) => {
      mockedAxios.post.mockRejectedValue(Object.assign(new Error('4xx'), { response }));

      await expect(getAxelarFeeWithFallback(withdrawParams())).rejects.toMatchObject({
        type: BridgeErrorType.AXELAR_GAS_ESTIMATE_FAILED,
        message: expect.stringContaining(message),
      });
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('returns to the Axelar API fee on the next call once the API responds again', async () => {
      mockedAxios.post.mockRejectedValueOnce(corsError()).mockResolvedValueOnce({ data: '42' });

      const first = await getAxelarFeeWithFallback(withdrawParams());
      const second = await getAxelarFeeWithFallback(withdrawParams());

      expect(first.source).toBe('fallback');
      expect(second).toEqual({ fee: BigInt(42), source: 'axelar' });
    });

    it('throws AXELAR_GAS_ESTIMATE_FAILED with both reasons when the fallback also fails', async () => {
      mockedAxios.post.mockRejectedValue(corsError());
      mockedAxios.get.mockRejectedValue(new Error('price API down'));

      const promise = getAxelarFeeWithFallback(withdrawParams());

      await expect(promise).rejects.toBeInstanceOf(BridgeError);
      await expect(promise).rejects.toMatchObject({
        type: BridgeErrorType.AXELAR_GAS_ESTIMATE_FAILED,
        message: expect.stringMatching(/network error, possibly CORS.*price API down/),
      });
    });
  });

  describe('estimateFallbackAxelarFee', () => {
    it('requests both prices without custom headers', async () => {
      await estimateFallbackAxelarFee(withdrawParams());

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://checkout-api.immutable.com/v1/fiat/conversion?ids=immutable-x,ethereum&currencies=usd',
        { timeout: 5000 },
      );
    });

    it('computes (gas limit + base gas) × gas price × 2, converted, plus the fixed base fee', async () => {
      mockedAxios.get.mockResolvedValue({ data: { ethereum: { usd: 2000 }, 'immutable-x': { usd: 0.2 } } });

      const fee = await estimateFallbackAxelarFee(withdrawParams({
        getDestinationFeeData: async () => feeData(gwei(2)),
      }));

      // (250k + 250k) gas × 2 gwei × 2 = 0.002 ETH = 20 IMX at 10,000 IMX/ETH; 5 cents = 0.25 IMX
      expect(fee).toBe(BigInt('20250000000000000000'));
    });

    it.each([
      ['auto', 'auto', '20250000000000000000'],
      ['a number below 2', 1.2, '20250000000000000000'],
      ['a number above 2', 3, '30250000000000000000'],
      ['a fractional number above 2', 2.5, '25250000000000000000'],
    ])('uses max(gasMultiplier, 2) for %s', async (_, gasMultiplier, expected) => {
      mockedAxios.get.mockResolvedValue({ data: { ethereum: { usd: 2000 }, 'immutable-x': { usd: 0.2 } } });

      const fee = await estimateFallbackAxelarFee(withdrawParams({
        gasMultiplier,
        getDestinationFeeData: async () => feeData(gwei(2)),
      }));

      // (250k + 250k) gas × 2 gwei × multiplier = 0.001 ETH × multiplier = 10 IMX × multiplier; plus 0.25 IMX
      expect(fee).toBe(BigInt(expected));
    });

    it('applies the 1 gwei minimum gas price', async () => {
      mockedAxios.get.mockResolvedValue({ data: { ethereum: { usd: 2000 }, 'immutable-x': { usd: 0.2 } } });

      const lowGas = await estimateFallbackAxelarFee(withdrawParams({
        getDestinationFeeData: async () => feeData(gwei(0.1)),
      }));
      const oneGwei = await estimateFallbackAxelarFee(withdrawParams({
        getDestinationFeeData: async () => feeData(gwei(1)),
      }));

      expect(lowGas).toBe(oneGwei);
    });

    it.each([
      ['withdraw', withdrawParams, AXELAR_QUOTES.withdraw],
      ['deposit', depositParams, AXELAR_QUOTES.deposit],
    ])('stays between 1.5x and 4x of the Axelar quote for a %s', async (_, params, quote) => {
      mockedAxios.get.mockResolvedValue({ data: quote.prices });

      const fee = await estimateFallbackAxelarFee(params());

      expect(fee).toBeGreaterThanOrEqual((quote.totalFee * BigInt(3)) / BigInt(2));
      expect(fee).toBeLessThanOrEqual(quote.totalFee * BigInt(4));
    });

    it.each([
      ['a missing price', { ethereum: { usd: 2000 } }, 'no USD price for IMX'],
      ['a zero price', { ethereum: { usd: 0 }, 'immutable-x': { usd: 0.2 } }, 'no USD price for ETH'],
    ])('rejects %s', async (_, data, message) => {
      mockedAxios.get.mockResolvedValue({ data });

      await expect(estimateFallbackAxelarFee(withdrawParams())).rejects.toThrow(message);
    });

    it('rejects when the destination chain returns no gas price', async () => {
      await expect(estimateFallbackAxelarFee(withdrawParams({
        getDestinationFeeData: async () => ({ gasPrice: null, maxFeePerGas: null, maxPriorityFeePerGas: null } as any),
      }))).rejects.toThrow('destination chain returned no gas price');
    });
  });
});
