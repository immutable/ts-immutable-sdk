import { Web3Provider } from '@ethersproject/providers';
import { BigNumber, Contract } from 'ethers';
import { Environment } from '@imtbl/config';
import axios, { HttpStatusCode } from 'axios';
import {
  getAllBalances,
  getBalance,
  getBalances,
  getERC20Balance,
} from './balances';
import {
  BLOCKSCOUT_CHAIN_URL_MAP,
  ChainId,
  ChainName,
  ERC20ABI,
  GetTokenAllowListResult,
  NetworkInfo,
  TokenInfo,
} from '../types';
import { CheckoutError, CheckoutErrorType } from '../errors';
import * as tokens from '../tokens';
import { CheckoutConfiguration } from '../config';
import { BlockscoutTokenType } from '../client';

jest.mock('axios');
jest.mock('../tokens');
jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Contract: jest.fn(),
}));

describe('balances', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  const testCheckoutConfig = new CheckoutConfiguration({ baseConfig: { environment: Environment.PRODUCTION } });
  const currentBalance = BigNumber.from('1000000000000000000');
  const formattedBalance = '1.0';
  const mockGetBalance = jest.fn().mockResolvedValue(currentBalance);
  const mockGetNetwork = jest
    .fn()
    .mockResolvedValue({ chainId: ChainId.ETHEREUM, name: 'homestead' });

  jest.mock('../connect', () => ({
    getNetworkInfo: jest.fn().mockResolvedValue({
      chainId: ChainId.ETHEREUM,
      name: ChainName.ETHEREUM,
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
      // TODO: fix variable shadowing
      // eslint-disable-next-line @typescript-eslint/no-shadow
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

    it(
      'should throw a CheckoutError of type BalanceError with the right message if the current network is unsupported',
      async () => {
      // TODO: fix variable shadowing
      // eslint-disable-next-line @typescript-eslint/no-shadow
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
      },
    );
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
      nameMock = jest.fn().mockResolvedValue(ChainName.ETHEREUM);
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
          name: ChainName.ETHEREUM,
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
        // TODO: fix constructor naming
        // eslint-disable-next-line new-cap
        return new contract(mockProvider(), JSON.stringify(ERC20ABI), null);
      });

      await expect(
        getERC20Balance(mockProvider(), 'abc123', '0x10c'),
      ).rejects.toThrow(
        new CheckoutError(
          // eslint-disable-next-line max-len
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

    // TODO fix variable shadowing
    // eslint-disable-next-line @typescript-eslint/no-shadow
    let mockGetBalance: jest.Mock;
    // eslint-disable-next-line @typescript-eslint/no-shadow
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
          {
            name: 'NoAddress',
            address: '',
            symbol: 'NA',
            decimals: 18,
          } as TokenInfo,
        ],
      } as GetTokenAllowListResult);
      (tokens.getTokenAllowList as jest.Mock).mockImplementation(
        getTokenAllowListMock,
      );

      mockGetBalance = jest.fn().mockResolvedValue(currentBalance);

      mockGetNetwork = jest
        .fn()
        .mockResolvedValue({ chainId: ChainId.ETHEREUM, name: 'homestead' });

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
        .mockResolvedValueOnce('Matic')
        .mockResolvedValueOnce('NoAddress');
      symbolMock = jest
        .fn()
        .mockResolvedValueOnce('IMX')
        .mockResolvedValueOnce('MATIC')
        .mockResolvedValueOnce('NA');
      (Contract as unknown as jest.Mock).mockReturnValue({
        balanceOf: balanceOfMock,
        decimals: decimalsMock,
        name: nameMock,
        symbol: symbolMock,
      });
    });

    it('should call getBalance and getERC20Balance functions', async () => {
      const getAllBalancesResult = await getAllBalances(
        {
          remote: {
            getTokensConfig: () => ({
              blockscout: false,
            }),
          },
          networkMap: testCheckoutConfig.networkMap,
        } as unknown as CheckoutConfiguration,
        mockProviderForAllBalances() as unknown as Web3Provider,
        'abc123',
        ChainId.ETHEREUM,
      );

      expect(mockGetBalance).toBeCalledTimes(1);
      expect(balanceOfMock).toBeCalledTimes(2);
      expect(decimalsMock).toBeCalledTimes(2);
      expect(nameMock).toBeCalledTimes(2);
      expect(symbolMock).toBeCalledTimes(2);

      expect(getAllBalancesResult.balances).toEqual(
        expect.arrayContaining(
          [
            {
              balance: currentBalance,
              formattedBalance,
              token: {
                name: ChainName.ETHEREUM,
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
        ),
      );
    });

    it('should call getIndexerBalance', async () => {
      const chainId = Object.keys(BLOCKSCOUT_CHAIN_URL_MAP)[0] as unknown as ChainId;

      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: {
          items: [
            {
              token: {
                address: '0x0000000000000000000000000000000000001010',
                decimals: '18',
                name: 'Test Immutable X',
                symbol: 'tIMX',
                type: BlockscoutTokenType.ERC20,
              },
              value: '396897342421454458',
            },
            {
              token: {
                address: '0x65AA7a21B0f3ce9B478aAC3408fE75b423939b1F',
                decimals: '18',
                name: 'Ether',
                symbol: 'ETH',
                type: BlockscoutTokenType.ERC20,
              },
              value: '330000000000000000',
            },
          ],
          // eslint-disable-next-line @typescript-eslint/naming-convention
          next_page_params: null,
        },
      });

      const getAllBalancesResult = await getAllBalances(
        {
          remote: {
            getTokensConfig: () => ({
              blockscout: true,
            }),
          },
          networkMap: testCheckoutConfig.networkMap,
        } as unknown as CheckoutConfiguration,
        jest.fn() as unknown as Web3Provider,
        'abc123',
        chainId,
      );

      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        1,
        `${BLOCKSCOUT_CHAIN_URL_MAP[chainId]}/api/v2/addresses/abc123/tokens?type=${BlockscoutTokenType.ERC20}`,
      );

      expect(getAllBalancesResult.balances).toEqual([{
        balance: BigNumber.from('396897342421454458'),
        formattedBalance: '0.396897342421454458',
        token: {
          address: '0x0000000000000000000000000000000000001010',
          decimals: 18,
          name: 'Test Immutable X',
          symbol: 'tIMX',
          type: 'ERC-20',
        },
      },
      {
        balance: BigNumber.from('330000000000000000'),
        formattedBalance: '0.33',
        token: {
          address: '0x65AA7a21B0f3ce9B478aAC3408fE75b423939b1F',
          decimals: 18,
          name: 'Ether',
          symbol: 'ETH',
          type: 'ERC-20',
        },
      }]);
    });

    it('should call getIndexerBalance and throw error', async () => {
      const chainId = Object.keys(BLOCKSCOUT_CHAIN_URL_MAP)[0] as unknown as ChainId;

      mockedAxios.isAxiosError.mockReturnValue(true);
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: {
          items: [],
          // eslint-disable-next-line @typescript-eslint/naming-convention
          next_page_params: {},
        },
      });
      mockedAxios.get.mockRejectedValueOnce({ response: { status: HttpStatusCode.Forbidden }, message: 'test' });

      let message;
      let type;
      let data;
      try {
        await getAllBalances(
          {
            remote: {
              getTokensConfig: () => ({
                blockscout: true,
              }),
            },
            networkMap: testCheckoutConfig.networkMap,
          } as unknown as CheckoutConfiguration,
          jest.fn() as unknown as Web3Provider,
          '0xabc123', // use unique wallet address to prevent cached data
          chainId,
        );
      } catch (err: any) {
        message = err.message;
        type = err.type;
        data = err.data;
      }

      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        1,
        `${BLOCKSCOUT_CHAIN_URL_MAP[chainId]}/api/v2/addresses/0xabc123/tokens?type=${BlockscoutTokenType.ERC20}`,
      );

      expect(message).toEqual('test');
      expect(type).toEqual(CheckoutErrorType.GET_INDEXER_BALANCE_ERROR);
      expect(data).toEqual({
        code: HttpStatusCode.Forbidden,
        message: 'test',
      });
    });
  });

  describe('getBalances()', () => {
    let mockProviderForAllBalances: jest.Mock;

    beforeEach(() => {
      jest.restoreAllMocks();
      mockProviderForAllBalances = jest.fn().mockImplementation(() => ({
        getBalance: jest.fn().mockResolvedValue(currentBalance),
        getNetwork: jest.fn().mockResolvedValue({ chainId: ChainId.IMTBL_ZKEVM_TESTNET, name: 'ZKEVM' }),
        provider: {
          request: jest.fn(),
        },
      } as unknown as Web3Provider));
    });

    it('should call getERC20Balance functions', async () => {
      (Contract as unknown as jest.Mock).mockReturnValue({
        balanceOf: jest.fn().mockResolvedValue(currentBalance),
        decimals: jest.fn().mockResolvedValue(18),
        name: jest.fn().mockResolvedValue('zkCATS'),
        symbol: jest.fn().mockResolvedValue('zkCATS'),
        address: jest.fn().mockResolvedValue('0xaddr'),
      });

      const getBalancesResult = await getBalances(
        testCheckoutConfig,
        mockProviderForAllBalances() as unknown as Web3Provider,
        'abc123',
        [{
          name: 'zkCATS',
          symbol: 'zkCATS',
          decimals: 18,
          address: '0xaddr',
        }],
      );

      expect(getBalancesResult.balances).toEqual(
        expect.arrayContaining(
          [
            {
              balance: currentBalance,
              formattedBalance,
              token: {
                name: 'zkCATS',
                symbol: 'zkCATS',
                decimals: 18,
                address: '0xaddr',
              },
            },
          ],
        ),
      );
    });

    it('should return an empty list if the token list is empty', async () => {
      const getBalancesResult = await getBalances(
        testCheckoutConfig,
        mockProvider() as unknown as Web3Provider,
        'abc123',
        [],
      );
      expect(getBalancesResult.balances).toEqual([]);
    });
  });
});
