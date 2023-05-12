import { Web3Provider } from '@ethersproject/providers';
import { BigNumber, Contract } from 'ethers';
import { Environment } from '@imtbl/config';
import { getAllBalances, getBalance, getERC20Balance } from './balances';
import {
  ChainId,
  ERC20ABI,
  GetAllBalancesResult,
  GetTokenAllowListResult,
  NetworkInfo,
  ProductionChainIdNetworkMap,
  TokenInfo,
} from '../types';
import { CheckoutError, CheckoutErrorType } from '../errors';
import * as tokens from '../tokens';
import { CheckoutConfiguration } from '../config';

jest.mock('../tokens');
jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  Contract: jest.fn(),
}));

describe('balances', () => {
  const testCheckoutConfig = new CheckoutConfiguration({ baseConfig: { environment: Environment.PRODUCTION } });
  const currentBalance = BigNumber.from('1000000000000000000');
  const formattedBalance = '1.0';
  const mockGetBalance = jest.fn().mockResolvedValue(currentBalance);
  const mockGetNetwork = jest
    .fn()
    .mockResolvedValue({ chainId: 1, name: 'homestead' });

  jest.mock('../connect', () => ({
    getNetworkInfo: jest.fn().mockResolvedValue({
      chainId: 1,
      name: 'Ethereum',
      isSupported: true,
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      },
    } as NetworkInfo),
  }));

  const mockProvider = jest.fn().mockImplementation(() => ({
    getBalance: mockGetBalance,
    getNetwork: mockGetNetwork,
  } as unknown as Web3Provider));

  describe('getBalance()', () => {
    it('should call getBalance() on provider and return the balance', async () => {
      const balanceResult = await getBalance(
        testCheckoutConfig,
        mockProvider() as unknown as Web3Provider,
        '0xAddress',
      );
      expect(mockGetBalance).toBeCalledTimes(1);
      expect(balanceResult.balance).toEqual(currentBalance);
    });

    it('should catch an error from getBalance() and throw a CheckoutError of type BalanceError', async () => {
      const mockProvider = jest.fn().mockImplementation(() => ({
        getBalance: jest
          .fn()
          .mockRejectedValue(new Error('Error getting balance')),
        getNetwork: mockGetNetwork,
      }));

      await expect(getBalance(testCheckoutConfig, mockProvider(), '0xAddress')).rejects.toThrow(
        new CheckoutError(
          '[GET_BALANCE_ERROR] Cause:Error getting balance',
          CheckoutErrorType.GET_BALANCE_ERROR,
        ),
      );
    });

    it('should throw a CheckoutError of type BalanceError with the right message if the current network is unsupported', async () => {
      const mockProvider = jest.fn().mockImplementation(() => ({
        getBalance: jest
          .fn()
          .mockRejectedValue(new Error('Error getting balance')),
        getNetwork: jest.fn().mockResolvedValue({
          chainId: 0,
          name: 'homestead',
        }),
      }));

      await expect(getBalance(testCheckoutConfig, mockProvider(), '0xAddress')).rejects.toThrow(
        new CheckoutError(
          '[GET_BALANCE_ERROR] Cause:Chain:0 is not a supported chain',
          CheckoutErrorType.GET_BALANCE_ERROR,
        ),
      );
    });
  });

  describe('getERC20Balance()', () => {
    let balanceOfMock: jest.Mock;
    let decimalsMock: jest.Mock;
    let nameMock: jest.Mock;
    let symbolMock: jest.Mock;

    beforeEach(() => {
      jest.restoreAllMocks();

      balanceOfMock = jest.fn().mockResolvedValue(currentBalance);
      decimalsMock = jest.fn().mockResolvedValue(18);
      nameMock = jest.fn().mockResolvedValue('Ethereum');
      symbolMock = jest.fn().mockResolvedValue('ETH');
      (Contract as unknown as jest.Mock).mockReturnValue({
        balanceOf: balanceOfMock,
        decimals: decimalsMock,
        name: nameMock,
        symbol: symbolMock,
      });
    });

    it('should call balanceOf on the appropriate contract and return the balance', async () => {
      const testContractAddress = '0x10c';
      const balanceResult = await getERC20Balance(
        mockProvider(),
        'abc123',
        testContractAddress,
      );

      expect(balanceOfMock).toBeCalledTimes(1);
      expect(decimalsMock).toBeCalledTimes(1);
      expect(nameMock).toBeCalledTimes(1);
      expect(symbolMock).toBeCalledTimes(1);
      expect(balanceResult).toEqual({
        balance: currentBalance,
        formattedBalance,
        token: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
          address: testContractAddress,
        },
      });
    });

    it('should throw error if call to the contract fails', async () => {
      (Contract as unknown as jest.Mock).mockReturnValue({
        balanceOf: balanceOfMock,
        decimals: decimalsMock,
        name: jest
          .fn()
          .mockRejectedValue(new Error('Error getting name from contract')),
        symbol: symbolMock,
      });

      await expect(
        getERC20Balance(mockProvider(), 'abc123', '0x10c'),
      ).rejects.toThrow(
        new CheckoutError(
          '[GET_ERC20_BALANCE_ERROR] Cause:Error getting name from contract',
          CheckoutErrorType.GET_ERC20_BALANCE_ERROR,
        ),
      );
    });

    it('should throw an error if the contract address is invalid', async () => {
      (Contract as unknown as jest.Mock).mockImplementation(() => {
        const contract = jest.requireActual('ethers').Contract;
        return new contract(mockProvider(), JSON.stringify(ERC20ABI), null);
      });

      await expect(
        getERC20Balance(mockProvider(), 'abc123', '0x10c'),
      ).rejects.toThrow(
        new CheckoutError(
          '[GET_ERC20_BALANCE_ERROR] Cause:invalid contract address or ENS name (argument="addressOrName", value=undefined, code=INVALID_ARGUMENT, version=contracts/5.7.0)',
          CheckoutErrorType.GET_ERC20_BALANCE_ERROR,
        ),
      );
    });
  });

  describe('getAllBalances()', () => {
    let mockProviderForAllBalances: jest.Mock;
    let balanceOfMock: jest.Mock;
    let decimalsMock: jest.Mock;
    let nameMock: jest.Mock;
    let symbolMock: jest.Mock;

    let mockGetBalance: jest.Mock;
    let mockGetNetwork: jest.Mock;

    let getTokenAllowListMock: jest.Mock;

    beforeEach(() => {
      jest.restoreAllMocks();
      getTokenAllowListMock = jest.fn().mockReturnValue({
        tokens: [
          {
            name: 'Immutable X',
            address: '0xaddr',
            symbol: 'IMX',
            decimals: 18,
          } as TokenInfo,
          {
            name: 'Matic',
            address: '0xmaticAddr',
            symbol: 'MATIC',
            decimals: '18',
          },
        ],
      } as GetTokenAllowListResult);
      (tokens.getTokenAllowList as jest.Mock).mockImplementation(
        getTokenAllowListMock,
      );

      mockGetBalance = jest.fn().mockResolvedValue(currentBalance);

      mockGetNetwork = jest
        .fn()
        .mockResolvedValue({ chainId: 1, name: 'homestead' });

      mockProviderForAllBalances = jest.fn().mockImplementation(() => ({
        getBalance: mockGetBalance,
        getNetwork: mockGetNetwork,
        provider: {
          request: jest.fn(),
        },
      } as unknown as Web3Provider));

      balanceOfMock = jest.fn().mockResolvedValue(currentBalance);
      decimalsMock = jest.fn().mockResolvedValue(18);
      nameMock = jest
        .fn()
        .mockResolvedValueOnce('Immutable X')
        .mockResolvedValueOnce('Matic');
      symbolMock = jest
        .fn()
        .mockResolvedValueOnce('IMX')
        .mockResolvedValueOnce('MATIC');
      (Contract as unknown as jest.Mock).mockReturnValue({
        balanceOf: balanceOfMock,
        decimals: decimalsMock,
        name: nameMock,
        symbol: symbolMock,
      });
    });

    it('should call getBalance and getERC20Balance functions', async () => {
      const getAllBalancesResult = await getAllBalances(
        testCheckoutConfig,
        mockProviderForAllBalances() as unknown as Web3Provider,
        'abc123',
        ChainId.ETHEREUM,
      );

      expect(mockGetBalance).toBeCalledTimes(1);
      expect(balanceOfMock).toBeCalledTimes(2);
      expect(decimalsMock).toBeCalledTimes(2);
      expect(nameMock).toBeCalledTimes(2);
      expect(symbolMock).toBeCalledTimes(2);

      expect(getAllBalancesResult).toEqual({
        balances: [
          {
            balance: currentBalance,
            formattedBalance,
            token: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
            },
          },
          {
            balance: currentBalance,
            formattedBalance,
            token: {
              name: 'Immutable X',
              symbol: 'IMX',
              decimals: 18,
              address: '0xaddr',
            },
          },
          {
            balance: currentBalance,
            formattedBalance,
            token: {
              name: 'Matic',
              symbol: 'MATIC',
              decimals: 18,
              address: '0xmaticAddr',
            },
          },
        ],
      } as GetAllBalancesResult);
    });
  });
});
