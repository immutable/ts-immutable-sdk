import {
  ChainId, Checkout, GetBalanceResult, NamedBrowserProvider, NetworkInfo, TokenFilterTypes, TokenInfo,
} from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { getAllowedBalances } from './balance';

describe('getAllowedBalances', () => {
  const tokenInfo = {
    balance: BigInt(1),
    token: {
      symbol: 'QQQ',
      name: 'QQQ',
      address: '0xQ',
      icon: 'https://checkout-cdn.immutable.com/v1/blob/img/tokens/0xq.svg',
    } as TokenInfo,
    formattedBalance: '12.34',
  };

  const nativeTokenInfo = {
    balance: BigInt(2),
    token: {
      symbol: 'AAA',
      name: 'AAA',
      icon: 'https://checkout-cdn.immutable.com/v1/blob/img/tokens/aaa.svg',
    } as TokenInfo,
    formattedBalance: '6.34',
  };

  const balances: GetBalanceResult[] = [
    tokenInfo,
    {
      balance: BigInt(2),
      token: { symbol: 'AAA', name: 'AAA' } as TokenInfo,
      formattedBalance: '6.34',
    },
    {
      balance: BigInt(0), // <<< zero balance
      token: { symbol: 'BBB', name: 'BBB', address: '0xA' } as TokenInfo,
      formattedBalance: '25.34',
    },
    {
      balance: BigInt(1),
      token: { symbol: 'CCC', name: 'CCC', address: '0xC' } as TokenInfo,
      formattedBalance: '36.34',
    },
    {
      balance: BigInt(1),
      token: { symbol: 'DDD', name: 'DDD', address: '0xd' } as TokenInfo,
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
          symbol: 'QQQ',
        } as unknown as TokenInfo,
        {
          symbol: 'IMX',
        } as unknown as TokenInfo, // <<< allows NATIVE -- no address
      ],
    });

    const resp = await getAllowedBalances({
      checkout,
      provider: mockProvider as unknown as NamedBrowserProvider,
      allowTokenListType: TokenFilterTypes.BRIDGE,
    });

    expect(resp).toEqual({
      allowList: {
        tokens: [
          {
            address: tokenInfo.token.address,
            symbol: 'QQQ',
            icon: 'https://checkout-cdn.immutable.com/v1/blob/img/tokens/0xq.svg',
          },
          {
            symbol: 'IMX',
            icon: 'https://checkout-cdn.immutable.com/v1/blob/img/tokens/imx.svg',
          },
        ],
      },
      allowedBalances: [
        tokenInfo,
        nativeTokenInfo,
      ],
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
      provider: mockProvider as unknown as NamedBrowserProvider,
      allowTokenListType: TokenFilterTypes.BRIDGE,
    });

    expect(getTokenAllowListMock.mock.calls).toEqual([[{
      chainId: ChainId.IMTBL_ZKEVM_MAINNET, type: TokenFilterTypes.BRIDGE,
    }]]);

    getTokenAllowListMock.mockClear();
    await getAllowedBalances({
      checkout,
      provider: mockProvider as unknown as NamedBrowserProvider,
      allowTokenListType: TokenFilterTypes.SWAP,
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
      provider: mockProvider as unknown as NamedBrowserProvider,
      allowTokenListType: TokenFilterTypes.BRIDGE,
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
      provider: mockProvider as unknown as NamedBrowserProvider,
      allowTokenListType: TokenFilterTypes.BRIDGE,
    });

    expect(resp).toEqual({
      allowList: {
        tokens: [{
          address: tokenInfo.token.address,
          icon: 'https://checkout-cdn.immutable.com/v1/blob/img/tokens/0xq.svg',
        }],
      },
      allowedBalances: [tokenInfo],
    });
  });

  it('should accept a different policy', async () => {
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
        provider: mockProvider as unknown as NamedBrowserProvider,
        allowTokenListType: TokenFilterTypes.BRIDGE,
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

  it('should map asset icons to erc20 address and native token symbol', async () => {
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
          symbol: 'XAA',
        } as unknown as TokenInfo,
        {
          symbol: 'XBB',
        } as unknown as TokenInfo,
      ],
    });

    const resp = await getAllowedBalances({
      checkout,
      provider: mockProvider as unknown as NamedBrowserProvider,
      allowTokenListType: TokenFilterTypes.BRIDGE,
    });

    expect(resp?.allowList).toEqual({
      tokens: [
        {
          address: '0xA',
          symbol: 'XAA',
          icon: 'https://checkout-cdn.immutable.com/v1/blob/img/tokens/0xa.svg',
        },
        {
          symbol: 'XBB',
          icon: 'https://checkout-cdn.immutable.com/v1/blob/img/tokens/xbb.svg',
        },
      ],
    });
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
      provider: mockProvider as unknown as NamedBrowserProvider,
      allowTokenListType: TokenFilterTypes.BRIDGE,
    });

    expect(resp).toEqual({
      allowList: {
        tokens: [{
          address: '0xA',
          icon: 'https://checkout-cdn.immutable.com/v1/blob/img/tokens/0xa.svg',
        }],
      },
      allowedBalances: [],
    });
  });

  it('should return allowedBalances when casing on address is different', async () => {
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
          address: '0xD',
        } as unknown as TokenInfo,
      ],
    });

    const resp = await getAllowedBalances({
      checkout,
      provider: mockProvider as unknown as NamedBrowserProvider,
      allowTokenListType: TokenFilterTypes.BRIDGE,
    });

    expect(resp).toEqual({
      allowList: {
        tokens: [{
          address: '0xD',
          icon: 'https://checkout-cdn.immutable.com/v1/blob/img/tokens/0xd.svg',
        }],
      },
      allowedBalances: [{
        balance: BigInt(1),
        token: {
          symbol: 'DDD',
          name: 'DDD',
          address: '0xd',
          icon: 'https://checkout-cdn.immutable.com/v1/blob/img/tokens/0xd.svg',
        } as TokenInfo,
        formattedBalance: '36.34',
      }],
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
      provider: mockProvider as unknown as NamedBrowserProvider,
      allowTokenListType: TokenFilterTypes.BRIDGE,
    });

    expect(resp).toEqual({
      allowList: {
        tokens: [{
          address: '0xA',
          icon: 'https://checkout-cdn.immutable.com/v1/blob/img/tokens/0xa.svg',
        }],
      },
      allowedBalances: [],
    });
  });
});
