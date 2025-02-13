import { Environment } from '@imtbl/config';
import { HttpStatusCode } from 'axios';
import { BrowserProvider, Contract, JsonRpcProvider } from 'ethers';
import {
  getAllBalances,
  getBalance,
  getBalances,
  getERC20Balance,
  resetBlockscoutClientMap,
} from './balances';
import {
  ChainId,
  ChainName,
  GetTokenAllowListResult,
  NetworkInfo,
  TokenInfo,
} from '../types';
import { CheckoutErrorType } from '../errors';
import * as tokens from '../tokens';
import { CheckoutConfiguration } from '../config';
import {
  Blockscout,
  BlockscoutNativeTokenData,
  BlockscoutToken,
  BlockscoutTokens,
  BlockscoutTokenType,
} from '../api/blockscout';
import { ERC20ABI, NATIVE } from '../env';
import { HttpClient } from '../api/http';

jest.mock('../api/http');
jest.mock('../api/blockscout');
jest.mock('../tokens');
jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Contract: jest.fn(),
}));

describe('balances', () => {
  const mockedHttpClient = new HttpClient() as jest.Mocked<HttpClient>;
  const testCheckoutConfig = new CheckoutConfiguration(
    {
      baseConfig: { environment: Environment.PRODUCTION },
    },
    mockedHttpClient,
  );
  const currentBalance = BigInt('1000000000000000000');
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
  } as unknown as BrowserProvider));

  beforeEach(() => {
    jest.spyOn(console, 'info').mockImplementation(() => {});
  });

  describe('getBalance()', () => {
    it('should call getBalance() on provider and return the balance', async () => {
      const balanceResult = await getBalance(
        testCheckoutConfig,
        mockProvider(),
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

      let message;
      let type;
      try {
        await getBalance(testCheckoutConfig, mockProvider(), '0xAddress');
      } catch (err: any) {
        message = err.message;
        type = err.type;
      }

      expect(message).toContain('Error getting balance');
      expect(type).toEqual(CheckoutErrorType.GET_BALANCE_ERROR);
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

        let message;
        let type;
        try {
          await getBalance(testCheckoutConfig, mockProvider(), '0xAddress');
        } catch (err: any) {
          message = err.message;
          type = err.type;
        }

        expect(message).toContain('Chain:0 is not a supported chain');
        expect(type).toEqual(CheckoutErrorType.GET_BALANCE_ERROR);
      },
    );
  });

  describe('getERC20Balance()', () => {
    const testContractAddress = '0x10c';

    let balanceOfMock: jest.Mock;
    let getERC20TokenInfoMock: jest.Mock;

    beforeEach(() => {
      jest.restoreAllMocks();

      balanceOfMock = jest.fn().mockResolvedValue(currentBalance);
      getERC20TokenInfoMock = jest.fn().mockResolvedValue({
        name: ChainName.ETHEREUM,
        symbol: 'ETH',
        decimals: 18,
        address: testContractAddress,
      });
      (tokens.getERC20TokenInfo as jest.Mock).mockImplementation(
        getERC20TokenInfoMock,
      );
      (Contract as unknown as jest.Mock).mockReturnValue({
        balanceOf: balanceOfMock,
      });
    });

    it('should call balanceOf on the appropriate contract and return the balance', async () => {
      const balanceResult = await getERC20Balance(
        mockProvider(),
        'abc123',
        testContractAddress,
      );

      expect(balanceOfMock).toBeCalledTimes(1);
      expect(getERC20TokenInfoMock).toBeCalledTimes(1);
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
        balanceOf: jest
          .fn()
          .mockRejectedValue(new Error('Error getting balance from contract')),
      });

      let message;
      let type;
      try {
        await getERC20Balance(mockProvider(), 'abc123', '0x10c');
      } catch (err: any) {
        message = err.message;
        type = err.type;
      }

      expect(message).toContain('Error getting balance from contract');
      expect(type).toEqual(CheckoutErrorType.GET_ERC20_BALANCE_ERROR);
    });

    it('should throw an error if the contract address is invalid', async () => {
      (Contract as unknown as jest.Mock).mockImplementation(() => {
        const contract = jest.requireActual('ethers').Contract;
        // TODO: fix constructor naming
        // eslint-disable-next-line new-cap
        return new contract(mockProvider(), JSON.stringify(ERC20ABI), null);
      });

      let type;
      try {
        await getERC20Balance(mockProvider(), 'abc123', '0x10c');
      } catch (err: any) {
        type = err.type;
      }

      expect(type).toEqual(CheckoutErrorType.GET_ERC20_BALANCE_ERROR);
    });
  });

  describe('getAllBalances()', () => {
    let mockProviderForAllBalances: jest.Mock;
    let balanceOfMock: jest.Mock;
    let getERC20TokenInfoMock: jest.Mock;

    // TODO fix variable shadowing
    // eslint-disable-next-line @typescript-eslint/no-shadow
    let mockGetBalance: jest.Mock;
    // eslint-disable-next-line @typescript-eslint/no-shadow
    let mockGetNetwork: jest.Mock;

    let getTokenAllowListMock: jest.Mock;
    let getTokensByWalletAddressMock: jest.Mock;
    let getNativeTokenByWalletAddressMock: jest.Mock;

    beforeEach(() => {
      jest.restoreAllMocks();
      resetBlockscoutClientMap();
      jest.spyOn(console, 'info').mockImplementation(() => {});
      getTokenAllowListMock = jest.fn().mockReturnValue({
        tokens: [
          {
            name: 'Immutable X',
            address: '0xL1Address',
            symbol: 'IMX',
            decimals: 18,
          } as TokenInfo,
          {
            name: 'Matic',
            address: '0xmaticAddress',
            symbol: 'MATIC',
            decimals: '18',
          },
          {
            name: ChainName.ETHEREUM,
            address: NATIVE,
            symbol: 'ETH',
            decimals: 18,
          } as TokenInfo,
        ],
      } as GetTokenAllowListResult);
      (tokens.getTokenAllowList as jest.Mock).mockImplementation(
        getTokenAllowListMock,
      );

      Blockscout.isChainSupported = jest.fn().mockResolvedValue(true);

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
      } as unknown as BrowserProvider));

      balanceOfMock = jest.fn().mockResolvedValue(currentBalance);

      getERC20TokenInfoMock = jest.fn()
        .mockResolvedValueOnce({
          name: 'Immutable X',
          symbol: 'IMX',
          decimals: 18,
          address: '0xL1Address',
        })
        .mockResolvedValueOnce({
          name: 'Matic',
          symbol: 'MATIC',
          decimals: 18,
          address: '0xmaticAddress',
        })
        .mockResolvedValueOnce({
          name: ChainName.ETHEREUM,
          symbol: 'ETH',
          decimals: 18,
          address: NATIVE,
        });
      (tokens.getERC20TokenInfo as jest.Mock).mockImplementation(
        getERC20TokenInfoMock,
      );

      (Contract as unknown as jest.Mock).mockReturnValue({
        balanceOf: balanceOfMock,
      });
    });

    it('should fail if no wallet address or provider are given', async () => {
      jest.spyOn(Blockscout, 'isChainSupported').mockReturnValue(false);

      let message;
      try {
        await getAllBalances(
          {
            remote: {},
            networkMap: testCheckoutConfig.networkMap,
          } as unknown as CheckoutConfiguration,
          undefined,
          undefined,
          ChainId.ETHEREUM,
        );
      } catch (err: any) {
        message = err.message;
      }
      expect(message).toContain('both walletAddress and provider are missing');
    });

    it('should fail if no provider is given and indexer is disabled', async () => {
      jest.spyOn(Blockscout, 'isChainSupported').mockReturnValue(false);

      let message;
      try {
        await getAllBalances(
          {
            remote: {},
            networkMap: testCheckoutConfig.networkMap,
          } as unknown as CheckoutConfiguration,
          undefined,
          'wallet-address',
          ChainId.ETHEREUM,
        );
      } catch (e: any) {
        message = e.message;
      }
      expect(message).toContain('indexer is disabled for this chain, you must provide a provider');
    });

    it('should call getBalance and getERC20Balance functions with native and ERC20 tokens', async () => {
      jest.spyOn(Blockscout, 'isChainSupported').mockReturnValue(false);

      const getAllBalancesResult = await getAllBalances(
        {
          remote: {
            getHttpClient: () => mockedHttpClient,
          },
          networkMap: testCheckoutConfig.networkMap,
        } as unknown as CheckoutConfiguration,
        mockProviderForAllBalances(),
        'abc123',
        ChainId.ETHEREUM,
      );

      expect(mockGetBalance).toBeCalledTimes(1);
      expect(balanceOfMock).toBeCalledTimes(2);

      expect(getAllBalancesResult.balances).toEqual(
        expect.arrayContaining(
          [
            {
              balance: currentBalance,
              formattedBalance,
              token: {
                name: 'Immutable X',
                symbol: 'IMX',
                decimals: 18,
                address: '0xL1Address',
              },
            },
            {
              balance: currentBalance,
              formattedBalance,
              token: {
                name: 'Matic',
                symbol: 'MATIC',
                decimals: 18,
                address: '0xmaticAddress',
              },
            },
            {
              balance: currentBalance,
              formattedBalance,
              token: {
                name: ChainName.ETHEREUM,
                symbol: 'ETH',
                decimals: 18,
                address: NATIVE,
              },
            },
          ],
        ),
      );
    });

    it('should call getBlockscoutBalance', async () => {
      (tokens.getTokenAllowList as jest.Mock).mockReturnValue({
        tokens: [
          {
            name: 'Immutable X',
            address: 'native',
            symbol: 'IMX',
            decimals: 18,
          } as TokenInfo,
          {
            name: ChainName.ETHEREUM,
            address: '0x65AA7a21B0f3ce9B478aAC3408fE75b423939b1F',
            symbol: 'ETH',
            decimals: 18,
          } as TokenInfo,
        ],
      });

      getTokensByWalletAddressMock = jest.fn().mockResolvedValue({
        items: [
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
      } as BlockscoutTokens);

      getNativeTokenByWalletAddressMock = jest.fn().mockResolvedValue({
        token: {
          name: 'IMX',
          symbol: 'IMX',
          decimals: '18',
          address: '',
        } as BlockscoutNativeTokenData,
        value: '777777777777777777',
      } as BlockscoutToken);

      (Blockscout as unknown as jest.Mock).mockReturnValue({
        getTokensByWalletAddress: getTokensByWalletAddressMock,
        getNativeTokenByWalletAddress: getNativeTokenByWalletAddressMock,
      });

      const getAllBalancesResult = await getAllBalances(
        {
          remote: {
            getHttpClient: () => mockedHttpClient,
          },
          networkMap: testCheckoutConfig.networkMap,
        } as unknown as CheckoutConfiguration,
        jest.fn() as unknown as JsonRpcProvider,
        'abc123',
        ChainId.ETHEREUM,
      );

      expect(getNativeTokenByWalletAddressMock).toHaveBeenCalledTimes(1);
      expect(getTokensByWalletAddressMock).toHaveBeenCalledTimes(1);

      expect(getAllBalancesResult.balances).toEqual([
        {
          balance: BigInt('330000000000000000'),
          formattedBalance: '0.33',
          token: {
            address: '0x65AA7a21B0f3ce9B478aAC3408fE75b423939b1F',
            decimals: 18,
            name: 'Ether',
            symbol: 'ETH',
            type: 'ERC-20',
          },
        },
        {
          balance: BigInt('777777777777777777'),
          formattedBalance: '0.777777777777777777',
          token: {
            address: NATIVE,
            decimals: 18,
            name: 'IMX',
            symbol: 'IMX',
          },
        },
      ]);
    });

    it('should call getBlockscoutBalance with undefined filterTokens', async () => {
      getTokenAllowListMock = jest.fn().mockReturnValue({
        tokens: [],
      } as GetTokenAllowListResult);
      (tokens.getTokenAllowList as jest.Mock).mockImplementation(
        getTokenAllowListMock,
      );

      getTokensByWalletAddressMock = jest.fn().mockResolvedValue({
        items: [
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
      } as BlockscoutTokens);

      getNativeTokenByWalletAddressMock = jest.fn().mockResolvedValue({
        token: {
          name: 'IMX',
          symbol: 'IMX',
          decimals: '18',
          address: '',
        } as BlockscoutNativeTokenData,
        value: '777777777777777777',
      } as BlockscoutToken);

      (Blockscout as unknown as jest.Mock).mockReturnValue({
        getTokensByWalletAddress: getTokensByWalletAddressMock,
        getNativeTokenByWalletAddress: getNativeTokenByWalletAddressMock,
      });

      const getAllBalancesResult = await getAllBalances(
        {
          remote: {
            getHttpClient: () => mockedHttpClient,
          },
          networkMap: new CheckoutConfiguration(
            {
              baseConfig: { environment: Environment.SANDBOX },
            },
            mockedHttpClient,
          ).networkMap,
        } as unknown as CheckoutConfiguration,
        jest.fn() as unknown as JsonRpcProvider,
        'abc123',
        ChainId.SEPOLIA, // L1 Chain chain will pass a filterTokens list
      );

      expect(getNativeTokenByWalletAddressMock).toHaveBeenCalledTimes(1);
      expect(getTokensByWalletAddressMock).toHaveBeenCalledTimes(1);

      expect(getAllBalancesResult.balances).toEqual([]);
    });

    it('should call getBlockscoutBalance and return native balance on ERC20 404', async () => {
      getTokensByWalletAddressMock = jest.fn().mockRejectedValue(
        { code: HttpStatusCode.NotFound, message: 'not found' },
      );

      getNativeTokenByWalletAddressMock = jest.fn().mockResolvedValue({
        token: {
          name: 'IMX',
          symbol: 'IMX',
          decimals: '18',
          address: '',
        } as BlockscoutNativeTokenData,
        value: '777777777777777777',
      } as BlockscoutToken);

      (Blockscout as unknown as jest.Mock).mockReturnValue({
        getTokensByWalletAddress: getTokensByWalletAddressMock,
        getNativeTokenByWalletAddress: getNativeTokenByWalletAddressMock,
      });

      const getAllBalancesResult = await getAllBalances(
        {
          remote: {
            getHttpClient: () => mockedHttpClient,
          },
          networkMap: testCheckoutConfig.networkMap,
        } as unknown as CheckoutConfiguration,
        jest.fn() as unknown as JsonRpcProvider,
        'abc123',
        ChainId.ETHEREUM,
      );

      expect(getNativeTokenByWalletAddressMock).toHaveBeenCalledTimes(1);
      expect(getTokensByWalletAddressMock).toHaveBeenCalledTimes(1);

      expect(getAllBalancesResult.balances).toEqual([
        {
          balance: BigInt('777777777777777777'),
          formattedBalance: '0.777777777777777777',
          token: {
            address: NATIVE,
            decimals: 18,
            name: 'IMX',
            symbol: 'IMX',
          },
        },
      ]);
    });

    it('should call getBlockscoutBalance and return ERC20 balances on native 404', async () => {
      (tokens.getTokenAllowList as jest.Mock).mockReturnValue({
        tokens: [
          {
            name: ChainName.ETHEREUM,
            address: '0x65AA7a21B0f3ce9B478aAC3408fE75b423939b1F',
            symbol: 'ETH',
            decimals: 18,
          } as TokenInfo,
        ],
      });

      getTokensByWalletAddressMock = jest.fn().mockResolvedValue({
        items: [
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
      } as BlockscoutTokens);

      getNativeTokenByWalletAddressMock = jest.fn().mockRejectedValue(
        { code: HttpStatusCode.NotFound, message: 'not found' },
      );

      (Blockscout as unknown as jest.Mock).mockReturnValue({
        getTokensByWalletAddress: getTokensByWalletAddressMock,
        getNativeTokenByWalletAddress: getNativeTokenByWalletAddressMock,
      });

      const getAllBalancesResult = await getAllBalances(
        {
          remote: {
            getHttpClient: () => mockedHttpClient,
          },
          networkMap: testCheckoutConfig.networkMap,
        } as unknown as CheckoutConfiguration,
        jest.fn() as unknown as JsonRpcProvider,
        'abc123',
        ChainId.ETHEREUM,
      );

      expect(getNativeTokenByWalletAddressMock).toHaveBeenCalledTimes(1);
      expect(getTokensByWalletAddressMock).toHaveBeenCalledTimes(1);

      expect(getAllBalancesResult.balances).toEqual([
        {
          balance: BigInt('330000000000000000'),
          formattedBalance: '0.33',
          token: {
            address: '0x65AA7a21B0f3ce9B478aAC3408fE75b423939b1F',
            decimals: 18,
            name: 'Ether',
            symbol: 'ETH',
            type: 'ERC-20',
          },
        },
      ]);
    });

    it('should call getBlockscoutBalance and return empty balance due to 404', async () => {
      getTokensByWalletAddressMock = jest.fn().mockRejectedValue(
        { code: HttpStatusCode.NotFound, message: 'not found' },
      );

      getNativeTokenByWalletAddressMock = jest.fn().mockRejectedValue(
        { code: HttpStatusCode.NotFound, message: 'not found' },
      );

      (Blockscout as unknown as jest.Mock).mockReturnValue({
        getTokensByWalletAddress: getTokensByWalletAddressMock,
        getNativeTokenByWalletAddress: getNativeTokenByWalletAddressMock,
      });

      const getAllBalancesResult = await getAllBalances(
        {
          remote: {
            getHttpClient: () => mockedHttpClient,
          },
          networkMap: testCheckoutConfig.networkMap,
        } as unknown as CheckoutConfiguration,
        jest.fn() as unknown as JsonRpcProvider,
        'abc123',
        ChainId.ETHEREUM,
      );

      expect(getNativeTokenByWalletAddressMock).toHaveBeenCalledTimes(1);
      expect(getTokensByWalletAddressMock).toHaveBeenCalledTimes(1);

      expect(getAllBalancesResult.balances).toEqual([]);
    });

    it('should fallback to balances via RPC if Blockscout rate limits with 429 error', async () => {
      getTokensByWalletAddressMock = jest.fn().mockRejectedValue(
        { code: HttpStatusCode.TooManyRequests, message: 'Too many requests' },
      );

      (Blockscout as unknown as jest.Mock).mockReturnValue({
        getTokensByWalletAddress: getTokensByWalletAddressMock,
        getNativeTokenByWalletAddress: getNativeTokenByWalletAddressMock,
      });

      let type;
      let getAllBalancesResult;
      try {
        getAllBalancesResult = await getAllBalances(
          {
            remote: {
              getHttpClient: () => mockedHttpClient,
            },
            networkMap: testCheckoutConfig.networkMap,
          } as unknown as CheckoutConfiguration,
          jest.fn() as unknown as JsonRpcProvider,
          '0xabc123', // use unique wallet address to prevent cached data
          ChainId.ETHEREUM,
        );
      } catch (err: any) {
        type = err.type;
      }

      expect(getTokensByWalletAddressMock).toHaveBeenCalledTimes(1);

      expect(type).toEqual(undefined);
      expect(getAllBalancesResult?.balances).toEqual(
        expect.arrayContaining(
          [
            {
              balance: currentBalance,
              formattedBalance,
              token: {
                name: 'Immutable X',
                symbol: 'IMX',
                decimals: 18,
                address: '0xL1Address',
              },
            },
            {
              balance: currentBalance,
              formattedBalance,
              token: {
                name: 'Matic',
                symbol: 'MATIC',
                decimals: 18,
                address: '0xmaticAddress',
              },
            },
          ],
        ),
      );
    });

    const testCases = [{
      errorMessage: 'test',
      expectedErrorMessage: 'test',
    },
    {
      errorMessage: '',
      expectedErrorMessage: 'InternalServerError | getTokensByWalletAddress',
    },
    {
      errorMessage: undefined,
      expectedErrorMessage: 'InternalServerError | getTokensByWalletAddress',
    }];

    testCases.forEach(async (testCase) => {
      it('should call getBlockscoutBalance and throw error', async () => {
        getTokensByWalletAddressMock = jest.fn().mockRejectedValue(
          { code: HttpStatusCode.Forbidden, message: testCase.errorMessage },
        );

        (Blockscout as unknown as jest.Mock).mockReturnValue({
          getTokensByWalletAddress: getTokensByWalletAddressMock,
          getNativeTokenByWalletAddress: getNativeTokenByWalletAddressMock,
        });

        let message;
        let type;
        let data;
        try {
          await getAllBalances(
            {
              remote: {
                getHttpClient: () => mockedHttpClient,
              },
              networkMap: testCheckoutConfig.networkMap,
            } as unknown as CheckoutConfiguration,
            jest.fn() as unknown as JsonRpcProvider,
            '0xabc123', // use unique wallet address to prevent cached data
            ChainId.ETHEREUM,
          );
        } catch (err: any) {
          message = err.message;
          type = err.type;
          data = err.data;
        }

        expect(getTokensByWalletAddressMock).toHaveBeenCalledTimes(1);

        expect(message).toEqual(testCase.expectedErrorMessage);
        expect(type).toEqual(CheckoutErrorType.GET_INDEXER_BALANCE_ERROR);
        expect(data.error).toEqual({
          code: HttpStatusCode.Forbidden,
          message: testCase.errorMessage,
        });
      });
    });

    it('should fail if unsupported chain is provided', async () => {
      let message;
      let type;
      try {
        await getAllBalances(
          {
            remote: {},
            networkMap: testCheckoutConfig.networkMap,
          } as unknown as CheckoutConfiguration,
          jest.fn() as unknown as JsonRpcProvider,
          '0xabc123', // use unique wallet address to prevent cached data
          ChainId.SEPOLIA,
        );
      } catch (err: any) {
        message = err.message;
        type = err.type;
      }

      expect(message).toEqual(`chain ID ${ChainId.SEPOLIA} not supported by the environment`);
      expect(type).toEqual(CheckoutErrorType.CHAIN_NOT_SUPPORTED_ERROR);
    });
  });

  describe('getBalances()', () => {
    let mockProviderForAllBalances: jest.Mock;
    let getERC20TokenInfoMock: jest.Mock;

    beforeEach(() => {
      jest.restoreAllMocks();
      mockProviderForAllBalances = jest.fn().mockImplementation(() => ({
        getBalance: jest.fn().mockResolvedValue(currentBalance),
        getNetwork: jest.fn().mockResolvedValue({ chainId: ChainId.IMTBL_ZKEVM_TESTNET, name: 'ZKEVM' }),
        provider: {
          request: jest.fn(),
        },
      } as unknown as BrowserProvider));
      getERC20TokenInfoMock = jest.fn()
        .mockResolvedValueOnce({
          name: 'zkCATS',
          symbol: 'zkCATS',
          decimals: 18,
          address: '0xaddr',
        });
      (tokens.getERC20TokenInfo as jest.Mock).mockImplementation(
        getERC20TokenInfoMock,
      );
    });

    it('should call getERC20Balance functions', async () => {
      (Contract as unknown as jest.Mock).mockReturnValue({
        balanceOf: jest.fn().mockResolvedValue(currentBalance),
      });

      const getBalancesResult = await getBalances(
        testCheckoutConfig,
        mockProviderForAllBalances(),
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
        mockProvider(),
        'abc123',
        [],
      );
      expect(getBalancesResult.balances).toEqual([]);
    });
  });
});
