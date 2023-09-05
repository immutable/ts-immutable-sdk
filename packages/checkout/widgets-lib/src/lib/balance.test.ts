import { Web3Provider } from '@ethersproject/providers';
import {
  ChainId, Checkout, GetBalanceResult, NetworkInfo, TokenFilterTypes, TokenInfo,
} from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { BigNumber } from 'ethers';
import { getAllowedBalances } from './balance';

describe('getAllowedBalances', () => {
  const tokenInfo = {
    balance: BigNumber.from(1),
    token: { symbol: 'QQQ', name: 'QQQ', address: '0xQ' } as TokenInfo,
    formattedBalance: '12.34',
  };

  const balances: GetBalanceResult[] = [
    tokenInfo,
    {
      balance: BigNumber.from(2),
      token: { symbol: 'AAA', name: 'AAA' } as TokenInfo,
      formattedBalance: '6.34',
    },
    {
      balance: BigNumber.from(0), // <<< zero balance
      token: { symbol: 'BBB', name: 'BBB', address: '0xA' } as TokenInfo,
      formattedBalance: '25.34',
    },
    {
      balance: BigNumber.from(1),
      token: { symbol: 'CCC', name: 'CCC', address: 'NATIVE' } as TokenInfo,
      formattedBalance: '36.34',
    },
  ];

  it('should return allowList and allowedBalances', async () => {
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });

    const mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0xaddress'),
      }),
    };
    jest.spyOn(checkout, 'getNetworkInfo').mockResolvedValue(
      { chainId: ChainId.IMTBL_ZKEVM_MAINNET } as unknown as NetworkInfo,
    );
    jest.spyOn(checkout, 'getAllBalances').mockResolvedValue({ balances });
    jest.spyOn(checkout, 'getTokenAllowList').mockResolvedValue({
      tokens: [
        {
          address: '0xQ',
        } as unknown as TokenInfo,
      ],
    });

    const resp = await getAllowedBalances({
      checkout,
      provider: mockProvider as unknown as Web3Provider,
      allowTokenListType: TokenFilterTypes.BRIDGE,
      allowNative: true,
    });

    expect(resp).toEqual({
      allowList: {
        tokens: [{ address: tokenInfo.token.address }],
      },
      allowedBalances: [tokenInfo],
    });
  });

  it('should use the correct allowTokenListType', async () => {
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });

    const mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0xaddress'),
      }),
    };
    jest.spyOn(checkout, 'getNetworkInfo').mockResolvedValue(
      { chainId: ChainId.IMTBL_ZKEVM_MAINNET } as unknown as NetworkInfo,
    );
    jest.spyOn(checkout, 'getAllBalances').mockResolvedValue({ balances });
    const getTokenAllowListMock = jest.spyOn(checkout, 'getTokenAllowList').mockResolvedValue({ tokens: [] });

    await getAllowedBalances({
      checkout,
      provider: mockProvider as unknown as Web3Provider,
      allowTokenListType: TokenFilterTypes.BRIDGE,
      allowNative: true,
    });

    expect(getTokenAllowListMock.mock.calls).toEqual([[{
      chainId: ChainId.IMTBL_ZKEVM_MAINNET, type: TokenFilterTypes.BRIDGE,
    }]]);

    getTokenAllowListMock.mockClear();
    await getAllowedBalances({
      checkout,
      provider: mockProvider as unknown as Web3Provider,
      allowTokenListType: TokenFilterTypes.SWAP,
      allowNative: true,
    });

    expect(getTokenAllowListMock.mock.calls).toEqual([[{
      chainId: ChainId.IMTBL_ZKEVM_MAINNET, type: TokenFilterTypes.SWAP,
    }]]);
  });

  it('should use the correct chainId', async () => {
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });

    const mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0xaddress'),
      }),
    };
    jest.spyOn(checkout, 'getNetworkInfo').mockResolvedValue(
      { chainId: ChainId.IMTBL_ZKEVM_MAINNET } as unknown as NetworkInfo,
    );
    const getAllBalancesMock = jest.spyOn(checkout, 'getAllBalances').mockResolvedValue({ balances });
    const getTokenAllowListMock = jest.spyOn(checkout, 'getTokenAllowList').mockResolvedValue({ tokens: [] });

    await getAllowedBalances({
      checkout,
      provider: mockProvider as unknown as Web3Provider,
      allowTokenListType: TokenFilterTypes.BRIDGE,
      allowNative: true,
      chainId: ChainId.IMTBL_ZKEVM_DEVNET,
    });

    expect(getAllBalancesMock.mock.calls).toEqual([[{
      chainId: ChainId.IMTBL_ZKEVM_DEVNET,
      provider: mockProvider,
      walletAddress: '0xaddress',
    }]]);
    expect(getTokenAllowListMock.mock.calls).toEqual([[{
      chainId: ChainId.IMTBL_ZKEVM_DEVNET, type: TokenFilterTypes.BRIDGE,
    }]]);
  });

  it('should return allowList and allowedBalances if getAllBalances succeed at least once', async () => {
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });

    const mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0xaddress'),
      }),
    };
    jest.spyOn(checkout, 'getNetworkInfo').mockResolvedValue(
      { chainId: ChainId.IMTBL_ZKEVM_MAINNET } as unknown as NetworkInfo,
    );
    jest.spyOn(checkout, 'getAllBalances')
      .mockRejectedValue(Error('error'))
      .mockResolvedValue({ balances });
    jest.spyOn(checkout, 'getTokenAllowList').mockResolvedValue({
      tokens: [
        {
          address: '0xQ',
        } as unknown as TokenInfo,
      ],
    });

    const resp = await getAllowedBalances({
      checkout,
      provider: mockProvider as unknown as Web3Provider,
      allowTokenListType: TokenFilterTypes.BRIDGE,
      allowNative: true,
    });

    expect(resp).toEqual({
      allowList: {
        tokens: [{ address: tokenInfo.token.address }],
      },
      allowedBalances: [tokenInfo],
    });
  });

  it.only('should accept a different policy', async () => {
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });

    const mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0xaddress'),
      }),
    };
    jest.spyOn(checkout, 'getNetworkInfo').mockResolvedValue(
      { chainId: ChainId.IMTBL_ZKEVM_MAINNET } as unknown as NetworkInfo,
    );
    const getAllBalancesSpy = jest.spyOn(checkout, 'getAllBalances')
      .mockRejectedValueOnce({ data: { code: 500 } })
      .mockRejectedValueOnce({ data: { code: 12 } })
      .mockResolvedValue({ balances });
    jest.spyOn(checkout, 'getTokenAllowList').mockResolvedValue({
      tokens: [
        {
          address: '0xQ',
        } as unknown as TokenInfo,
      ],
    });

    let error;
    try {
      await getAllowedBalances({
        checkout,
        provider: mockProvider as unknown as Web3Provider,
        allowTokenListType: TokenFilterTypes.BRIDGE,
        allowNative: true,
        retryPolicy: {
          retryIntervalMs: 0,
          retries: 2,
          nonRetryable: (err: any) => err.data.code === 12,
        },
      });
    } catch (err: any) {
      error = err;
    }

    expect(getAllBalancesSpy).toBeCalledTimes(2);
    expect(error.data.code).toEqual(12);
  });

  it('should not return zero balances', async () => {
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });

    const mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0xaddress'),
      }),
    };
    jest.spyOn(checkout, 'getNetworkInfo').mockResolvedValue(
      { chainId: ChainId.IMTBL_ZKEVM_MAINNET } as unknown as NetworkInfo,
    );
    jest.spyOn(checkout, 'getAllBalances').mockResolvedValue({ balances });
    jest.spyOn(checkout, 'getTokenAllowList').mockResolvedValue({
      tokens: [
        {
          address: '0xA',
        } as unknown as TokenInfo,
      ],
    });

    const resp = await getAllowedBalances({
      checkout,
      provider: mockProvider as unknown as Web3Provider,
      allowTokenListType: TokenFilterTypes.BRIDGE,
      allowNative: true,
    });

    expect(resp).toEqual({
      allowList: {
        tokens: [{ address: '0xA' }],
      },
      allowedBalances: [],
    });
  });

  it('should not return native address or empty address', async () => {
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });

    const mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0xaddress'),
      }),
    };
    jest.spyOn(checkout, 'getNetworkInfo').mockResolvedValue(
      { chainId: ChainId.IMTBL_ZKEVM_MAINNET } as unknown as NetworkInfo,
    );
    jest.spyOn(checkout, 'getAllBalances').mockResolvedValue({ balances });
    jest.spyOn(checkout, 'getTokenAllowList').mockResolvedValue({
      tokens: [
        {
          address: '0xA',
        } as unknown as TokenInfo,
      ],
    });

    const resp = await getAllowedBalances({
      checkout,
      provider: mockProvider as unknown as Web3Provider,
      allowTokenListType: TokenFilterTypes.BRIDGE,
      allowNative: true,
    });

    expect(resp).toEqual({
      allowList: {
        tokens: [{ address: '0xA' }],
      },
      allowedBalances: [],
    });
  });
});
