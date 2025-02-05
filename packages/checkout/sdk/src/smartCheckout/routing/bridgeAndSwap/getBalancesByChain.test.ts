import { Environment } from '@imtbl/config';
import { ChainId } from '../../../types';
import { getBalancesByChain } from './getBalancesByChain';
import { CheckoutConfiguration } from '../../../config';
import { HttpClient } from '../../../api/http';

describe('getBalancesByChain', () => {
  const mockedHttpClient = new HttpClient() as jest.Mocked<HttpClient>;
  const config = new CheckoutConfiguration({
    baseConfig: { environment: Environment.SANDBOX },
  }, mockedHttpClient);

  const l1balances = {
    success: true,
    balances: [
      {
        balance: BigInt(1),
        formattedBalance: '1',
        token: {
          decimals: 18,
          symbol: 'ETH',
          name: 'ETH',
        },
      },
      {
        balance: BigInt(2),
        formattedBalance: '2',
        token: {
          address: '0xIMX',
          decimals: 18,
          symbol: 'IMX',
          name: 'IMX',
        },
      },
    ],
  };

  const l2balances = {
    success: true,
    balances: [
      {
        balance: BigInt(3),
        formattedBalance: '3',
        token: {
          address: '0xIMX',
          decimals: 18,
          symbol: 'IMX',
          name: 'IMX',
        },
      },
      {
        balance: BigInt(4),
        formattedBalance: '4',
        token: {
          address: '0xYEET',
          decimals: 18,
          symbol: 'zkYEET',
          name: 'zkYEET',
        },
      },
    ],
  };

  it('should return l1balances and l2balances', () => {
    const tokenBalances = new Map();
    tokenBalances.set(ChainId.SEPOLIA, l1balances);

    tokenBalances.set(ChainId.IMTBL_ZKEVM_TESTNET, l2balances);

    const result = getBalancesByChain(config, tokenBalances);
    expect(result).toEqual(
      {
        l1balances: [
          {
            balance: BigInt(1),
            formattedBalance: '1',
            token: {
              decimals: 18,
              symbol: 'ETH',
              name: 'ETH',
            },
          },
          {
            balance: BigInt(2),
            formattedBalance: '2',
            token: {
              address: '0xIMX',
              decimals: 18,
              symbol: 'IMX',
              name: 'IMX',
            },
          },
        ],
        l2balances: [
          {
            balance: BigInt(3),
            formattedBalance: '3',
            token: {
              address: '0xIMX',
              decimals: 18,
              symbol: 'IMX',
              name: 'IMX',
            },
          },
          {
            balance: BigInt(4),
            formattedBalance: '4',
            token: {
              address: '0xYEET',
              decimals: 18,
              symbol: 'zkYEET',
              name: 'zkYEET',
            },
          },
        ],
      },
    );
  });

  it('should return empty arrays if no l1balances', () => {
    const tokenBalances = new Map();
    tokenBalances.set(ChainId.IMTBL_ZKEVM_TESTNET, l2balances);

    const result = getBalancesByChain(config, tokenBalances);
    expect(result).toEqual(
      {
        l1balances: [],
        l2balances: [],
      },
    );
  });

  it('should return empty arrays if l1balances undefined', () => {
    const tokenBalances = new Map();
    tokenBalances.set(ChainId.SEPOLIA, undefined);
    tokenBalances.set(ChainId.IMTBL_ZKEVM_TESTNET, l2balances);

    const result = getBalancesByChain(config, tokenBalances);
    expect(result).toEqual(
      {
        l1balances: [],
        l2balances: [],
      },
    );
  });

  it('should return empty arrays if l1balances has an error', () => {
    const tokenBalances = new Map();
    tokenBalances.set(ChainId.SEPOLIA, {
      error: new Error('error'),
      balances: [],
    });
    tokenBalances.set(ChainId.IMTBL_ZKEVM_TESTNET, l2balances);

    const result = getBalancesByChain(config, tokenBalances);
    expect(result).toEqual(
      {
        l1balances: [],
        l2balances: [],
      },
    );
  });

  it('should return empty arrays if l1balances failed', () => {
    const tokenBalances = new Map();
    tokenBalances.set(ChainId.SEPOLIA, {
      success: false,
      balances: [],
    });
    tokenBalances.set(ChainId.IMTBL_ZKEVM_TESTNET, l2balances);

    const result = getBalancesByChain(config, tokenBalances);
    expect(result).toEqual(
      {
        l1balances: [],
        l2balances: [],
      },
    );
  });

  it('should return empty arrays if no l2balances', () => {
    const tokenBalances = new Map();
    tokenBalances.set(ChainId.SEPOLIA, l1balances);

    const result = getBalancesByChain(config, tokenBalances);
    expect(result).toEqual(
      {
        l1balances: [],
        l2balances: [],
      },
    );
  });

  it('should return empty arrays if l2balances has an error', () => {
    const tokenBalances = new Map();
    tokenBalances.set(ChainId.IMTBL_ZKEVM_TESTNET, {
      error: new Error('error'),
      balances: [],
    });
    tokenBalances.set(ChainId.SEPOLIA, l1balances);

    const result = getBalancesByChain(config, tokenBalances);
    expect(result).toEqual(
      {
        l1balances: [],
        l2balances: [],
      },
    );
  });

  it('should return empty arrays if l2balances failed', () => {
    const tokenBalances = new Map();
    tokenBalances.set(ChainId.IMTBL_ZKEVM_TESTNET, {
      success: false,
      balances: [],
    });
    tokenBalances.set(ChainId.SEPOLIA, l1balances);

    const result = getBalancesByChain(config, tokenBalances);
    expect(result).toEqual(
      {
        l1balances: [],
        l2balances: [],
      },
    );
  });
});
