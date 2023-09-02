import { Web3Provider } from '@ethersproject/providers';
import {
  ChainId, Checkout, GetBalanceResult, NetworkInfo, TokenInfo,
} from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { BigNumber } from 'ethers';
import { getBridgeTokensAndBalances } from './getBridgeTokens';

describe('getBridgeTokensAndBalances', () => {
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

  it('should return allowList and allowedTokenBalances', async () => {
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

    const resp = await getBridgeTokensAndBalances(
      checkout,
      mockProvider as unknown as Web3Provider,
    );

    expect(resp).toEqual({
      allowList: {
        tokens: [{ address: tokenInfo.token.address }],
      },
      allowedTokenBalances: [tokenInfo],
    });
  });

  it('should return allowList and allowedTokenBalances if getAllBalances succeed at least once', async () => {
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

    const resp = await getBridgeTokensAndBalances(
      checkout,
      mockProvider as unknown as Web3Provider,
    );

    expect(resp).toEqual({
      allowList: {
        tokens: [{ address: tokenInfo.token.address }],
      },
      allowedTokenBalances: [tokenInfo],
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

    const resp = await getBridgeTokensAndBalances(
      checkout,
      mockProvider as unknown as Web3Provider,
    );

    expect(resp).toEqual({
      allowList: {
        tokens: [{ address: '0xA' }],
      },
      allowedTokenBalances: [],
    });
  });

  it('should not return NATIVE address or empty address', async () => {
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

    const resp = await getBridgeTokensAndBalances(
      checkout,
      mockProvider as unknown as Web3Provider,
    );

    expect(resp).toEqual({
      allowList: {
        tokens: [{ address: '0xA' }],
      },
      allowedTokenBalances: [],
    });
  });

  it('should return empty array if params are missing', async () => {
    const checkout = new Checkout({
      baseConfig: { environment: Environment.PRODUCTION },
    });
    expect(
      await getBridgeTokensAndBalances(
        checkout,
        null as unknown as Web3Provider,
      ),
    ).toEqual({});
  });
});
