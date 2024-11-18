import { BrowserProvider, parseUnits, TransactionRequest } from 'ethers';
import { CheckoutConfiguration } from '../config/config';
import { NamedBrowserProvider, TokenInfo } from '../types';
import { swap, swapQuote } from './swap';
import { createExchangeInstance } from '../instance';

jest.mock('../instance', () => ({
  createExchangeInstance: jest.fn(),
}));

describe('swapQuote', () => {
  const mockChainId = 13473;
  const mockConfig = {} as unknown as CheckoutConfiguration;
  const mockProvider = {
    getSigner: jest.fn().mockReturnValue({
      getAddress: jest.fn().mockResolvedValue('0xmockaddress'),
    }),
  } as unknown as BrowserProvider;
  const mockFromToken: TokenInfo = {
    address: '0x123',
    symbol: 'FROM',
    decimals: 18,
    name: 'From Token',
  };
  const mockToToken: TokenInfo = {
    address: '0x456',
    symbol: 'TO',
    decimals: 18,
    name: 'To Token',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call createExchangeInstance and execute swapQuote with fromAmount', async () => {
    const mockExchange = {
      getUnsignedSwapTxFromAmountIn: jest.fn().mockResolvedValue({ quote: '0xquotehash' }),
    };
    (createExchangeInstance as jest.Mock).mockResolvedValue(mockExchange);

    const result = await swapQuote(mockConfig, mockProvider, mockFromToken, mockToToken, '100');

    expect(createExchangeInstance).toHaveBeenCalledWith(mockChainId, mockConfig);
    expect(mockExchange.getUnsignedSwapTxFromAmountIn).toHaveBeenCalledWith(
      '0xmockaddress',
      mockFromToken.address,
      mockToToken.address,
      BigInt(parseUnits('100', mockFromToken.decimals)),
      undefined,
      undefined,
      undefined,
    );
    expect(result).toEqual({ quote: '0xquotehash' });
  });

  it('should call createExchangeInstance and execute swapQuote with toAmount', async () => {
    const mockExchange = {
      getUnsignedSwapTxFromAmountOut: jest.fn().mockResolvedValue({ quote: '0xquotehash' }),
    };
    (createExchangeInstance as jest.Mock).mockResolvedValue(mockExchange);

    const result = await swapQuote(mockConfig, mockProvider, mockFromToken, mockToToken, undefined, '200');

    expect(createExchangeInstance).toHaveBeenCalledWith(mockChainId, mockConfig);
    expect(mockExchange.getUnsignedSwapTxFromAmountOut).toHaveBeenCalledWith(
      '0xmockaddress',
      mockFromToken.address,
      mockToToken.address,
      BigInt(parseUnits('200', mockToToken.decimals)),
      undefined,
      undefined,
      undefined,
    );
    expect(result).toEqual({ quote: '0xquotehash' });
  });

  it('should throw an error if fromToken address is missing', async () => {
    const invalidFromToken = { ...mockFromToken, address: '' };
    await expect(swapQuote(mockConfig, mockProvider, invalidFromToken, mockToToken, '100'))
      .rejects.toThrow('fromToken address or decimals is missing.');
  });

  it('should throw an error if fromToken decimals is zero', async () => {
    const invalidFromToken = { ...mockFromToken, decimals: 0 };
    await expect(swapQuote(mockConfig, mockProvider, invalidFromToken, mockToToken, '100'))
      .rejects.toThrow('fromToken address or decimals is missing.');
  });

  it('should throw an error if toToken address is missing', async () => {
    const invalidToToken = { ...mockToToken, address: '' };
    await expect(swapQuote(mockConfig, mockProvider, mockFromToken, invalidToToken, '100'))
      .rejects.toThrow('toToken address or decimals is missing.');
  });

  it('should throw an error if toToken decimals is zero', async () => {
    const invalidToToken = { ...mockToToken, decimals: 0 };
    await expect(swapQuote(mockConfig, mockProvider, mockFromToken, invalidToToken, '100'))
      .rejects.toThrow('toToken address or decimals is missing.');
  });

  it('should throw an error if both fromAmount and toAmount are provided', async () => {
    await expect(swapQuote(mockConfig, mockProvider, mockFromToken, mockToToken, '100', '200'))
      .rejects.toThrow('Only one of fromAmount or toAmount can be provided.');
  });

  it('should throw an error if neither fromAmount nor toAmount is provided', async () => {
    await expect(swapQuote(mockConfig, mockProvider, mockFromToken, mockToToken))
      .rejects.toThrow('fromAmount or toAmount must be provided.');
  });
});

describe('swap', () => {
  const mockChainId = 13473;
  const mockConfig = {} as unknown as CheckoutConfiguration;
  const mockSigner = {
    getAddress: jest.fn().mockResolvedValue('0xmockaddress'),
    sendTransaction: jest.fn().mockResolvedValue({ hash: '0xtxhash' }),
  };
  const mockProvider = {
    getSigner: jest.fn().mockReturnValue(mockSigner),
    getNetwork: jest.fn().mockResolvedValue({ chainId: mockChainId }),
  } as unknown as NamedBrowserProvider;
  const mockFromToken: TokenInfo = {
    address: '0x123',
    symbol: 'FROM',
    decimals: 18,
    name: 'From Token',
  };
  const mockToToken: TokenInfo = {
    address: '0x456',
    symbol: 'TO',
    decimals: 18,
    name: 'To Token',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully execute a swap', async () => {
    const mockTransactionResponse = {
      wait: jest.fn().mockResolvedValue({ status: 1 }),
    };

    const mockExchange = {
      getUnsignedSwapTxFromAmountIn: jest.fn().mockResolvedValue({
        quote: '0xquotehash',
        swap: { transaction: { maxFeePerGas: '0xunsignedtx' } as TransactionRequest },
        approve: { transaction: { maxFeePerGas: '0xunsignedtx' } as TransactionRequest },
      }),
    };
    (createExchangeInstance as jest.Mock).mockResolvedValue(mockExchange);

    mockSigner.sendTransaction.mockResolvedValue({
      ...mockTransactionResponse,
      hash: '0xtxhash',
    });

    const result = await swap(mockConfig, mockProvider, mockFromToken, mockToToken, '100');

    expect(createExchangeInstance).toHaveBeenCalledWith(mockChainId, mockConfig);
    expect(mockExchange.getUnsignedSwapTxFromAmountIn).toHaveBeenCalledWith(
      '0xmockaddress',
      mockFromToken.address,
      mockToToken.address,
      BigInt(parseUnits('100', mockFromToken.decimals)),
      undefined,
      undefined,
      undefined,
    );
    expect(mockProvider.getNetwork).toHaveBeenCalled();
    expect(mockSigner.sendTransaction).toHaveBeenCalledWith({
      maxFeePerGas: BigInt('0x037e11d600'),
      maxPriorityFeePerGas: BigInt('0x02540be400'),
    });
    expect(mockTransactionResponse.wait).toHaveBeenCalled();
    expect(result).toEqual({
      quote: '0xquotehash',
      swap: {
        transaction: {
          maxFeePerGas: BigInt('0x037e11d600'),
          maxPriorityFeePerGas: BigInt('0x02540be400'),
        },
      },
      swapReceipt: { status: 1 },
    });
  });
});
