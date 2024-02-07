import { Environment } from '@imtbl/config';
import { Contract } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { ChainId, ChainName, TokenFilterTypes } from '../types';
import { getERC20TokenInfo, getTokenAllowList, isNativeToken } from './tokens';
import { RemoteConfigFetcher } from '../config/remoteConfigFetcher';
import { CheckoutConfiguration } from '../config';
import { ERC20ABI, NATIVE } from '../env';
import { CheckoutErrorType } from '../errors';
import { HttpClient } from '../api/http';

jest.mock('../config/remoteConfigFetcher');
jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Contract: jest.fn(),
}));

describe('token related functions', () => {
  let config: CheckoutConfiguration;
  const mockProvider = jest.fn().mockImplementation(() => ({} as unknown as Web3Provider));
  const mockedHttpClient: jest.Mocked<HttpClient> = new HttpClient() as jest.Mocked<HttpClient>;

  describe('when tokens are not configured', () => {
    it('should return the empty list of tokens', async () => {
      (RemoteConfigFetcher as unknown as jest.Mock).mockReturnValue({
        getTokensConfig: jest.fn().mockResolvedValue({ allowed: [] }),
      });
      config = new CheckoutConfiguration({
        baseConfig: { environment: Environment.SANDBOX },
      }, mockedHttpClient);
      await expect(
        await getTokenAllowList(config, {
          type: TokenFilterTypes.ALL,
          chainId: ChainId.SEPOLIA,
        }),
      ).toEqual({
        tokens: [],
      });
    });
  });

  describe('getTokenAllowList', () => {
    const remoteConfigMockReturn = {
      getTokensConfig: jest.fn().mockResolvedValue({
        allowed: [
          {
            address: '0x1',
            decimals: 18,
            name: 'token-aa-testnet',
            symbol: 'AA',
          },
          {
            address: '0x2',
            decimals: 18,
            name: 'token-bb-testnet',
            symbol: 'BB',
          },
          {
            address: '',
            decimals: 18,
            name: 'token-cc-testnet',
            symbol: 'CC',
          },
        ],
      }),
      getConfig: jest.fn().mockResolvedValue({
        overrides: {
          rpcURL: 'https://test',
        },
        tokens: [
          {
            address: '0x2',
            decimals: 18,
            name: 'token-bb-testnet',
            symbol: 'BB',
          },
        ],
      }),
    };

    const testcases = [
      {
        text: 'tokens with no filters (ALL type)',
        type: TokenFilterTypes.ALL,
        chainId: ChainId.SEPOLIA,
        exclude: [],
        result: [
          {
            address: '0x1',
            decimals: 18,
            name: 'token-aa-testnet',
            symbol: 'AA',
          },
          {
            address: '0x2',
            decimals: 18,
            name: 'token-bb-testnet',
            symbol: 'BB',
          },
          {
            address: '',
            decimals: 18,
            name: 'token-cc-testnet',
            symbol: 'CC',
          },
        ],
        remoteConfigMockReturn,
      },
      {
        text: 'exclude token with address',
        type: TokenFilterTypes.ALL,
        chainId: ChainId.SEPOLIA,
        exclude: [{ address: '0x2' }],
        result: [
          {
            address: '0x1',
            decimals: 18,
            name: 'token-aa-testnet',
            symbol: 'AA',
          },
          {
            address: '',
            decimals: 18,
            name: 'token-cc-testnet',
            symbol: 'CC',
          },
        ],
        remoteConfigMockReturn,
      },
      {
        text: 'exclude empty address',
        type: TokenFilterTypes.ALL,
        chainId: ChainId.SEPOLIA,
        exclude: [{ address: '' }],
        result: [
          {
            address: '0x1',
            decimals: 18,
            name: 'token-aa-testnet',
            symbol: 'AA',
          },
          {
            address: '0x2',
            decimals: 18,
            name: 'token-bb-testnet',
            symbol: 'BB',
          },
        ],
        remoteConfigMockReturn,
      },
      {
        text: 'tokens with SWAP filter',
        type: TokenFilterTypes.SWAP,
        chainId: ChainId.IMTBL_ZKEVM_DEVNET,
        result: [
          {
            address: '0x2',
            decimals: 18,
            name: 'token-bb-testnet',
            symbol: 'BB',
          },
        ],
        remoteConfigMockReturn,
      },
      {
        text: 'tokens with BRIDGE filter',
        type: TokenFilterTypes.BRIDGE,
        chainId: ChainId.IMTBL_ZKEVM_DEVNET,
        result: [
          {
            address: '',
            decimals: 18,
            name: 'token-cc-testnet',
            symbol: 'CC',
          },
        ],
        remoteConfigMockReturn: {
          ...remoteConfigMockReturn,
          getConfig: jest.fn().mockResolvedValue({
            [ChainId.IMTBL_ZKEVM_DEVNET]: {
              tokens: [
                {
                  address: '',
                  decimals: 18,
                  name: 'token-cc-testnet',
                  symbol: 'CC',
                },
              ],
            },
          }),
        },
      },
      {
        text: 'undefined SWAP tokens list',
        type: TokenFilterTypes.SWAP,
        chainId: ChainId.IMTBL_ZKEVM_DEVNET,
        result: [],
        remoteConfigMockReturn: {
          getTokensConfig: jest.fn().mockResolvedValue(undefined),
          getConfig: jest.fn().mockResolvedValue({}),
        },
      },
    ];

    testcases.forEach((testcase) => {
      it(`should return the filtered list of allowed tokens for a given ${testcase.text}`, async () => {
        (RemoteConfigFetcher as unknown as jest.Mock).mockReturnValue(testcase.remoteConfigMockReturn);
        config = new CheckoutConfiguration({
          baseConfig: { environment: Environment.SANDBOX },
        }, mockedHttpClient);

        await expect(
          await getTokenAllowList(config, {
            type: testcase.type,
            exclude: testcase.exclude,
            chainId: testcase.chainId,
          }),
        ).toEqual({
          tokens: testcase.result,
        });
      });
    });
  });

  describe('isNativeToken', () => {
    it('should return true if address is undefined', () => {
      expect(isNativeToken(undefined)).toBeTruthy();
    });

    it('should return true if address is empty', () => {
      expect(isNativeToken('')).toBeTruthy();
    });

    it('should return true if address is `native`', () => {
      expect(isNativeToken(NATIVE)).toBeTruthy();
    });

    it('should return true if address is `NATIVE`', () => {
      expect(isNativeToken('NATIVE')).toBeTruthy();
    });

    it('should return false if address is not NATIVE', () => {
      expect(isNativeToken('0x123')).toBeFalsy();
    });
  });

  describe('getERC20TokenInfo()', () => {
    let decimalsMock: jest.Mock;
    let nameMock: jest.Mock;
    let symbolMock: jest.Mock;

    beforeEach(() => {
      jest.restoreAllMocks();

      decimalsMock = jest.fn().mockResolvedValue(18);
      nameMock = jest.fn().mockResolvedValue(ChainName.ETHEREUM);
      symbolMock = jest.fn().mockResolvedValue('ETH');
      (Contract as unknown as jest.Mock).mockReturnValue({
        decimals: decimalsMock,
        name: nameMock,
        symbol: symbolMock,
      });
    });

    it('should call functions on contract and return the token information', async () => {
      const testContractAddress = '0x10c';
      const tokenInfo = await getERC20TokenInfo(mockProvider(), testContractAddress);

      expect(decimalsMock).toBeCalledTimes(1);
      expect(nameMock).toBeCalledTimes(1);
      expect(symbolMock).toBeCalledTimes(1);
      expect(tokenInfo).toEqual({
        name: ChainName.ETHEREUM,
        symbol: 'ETH',
        decimals: 18,
        address: testContractAddress,
      });
    });

    it('should throw error if call to the contract fails', async () => {
      (Contract as unknown as jest.Mock).mockReturnValue({
        decimals: decimalsMock,
        name: jest
          .fn()
          .mockRejectedValue(new Error('Error getting name from contract')),
        symbol: symbolMock,
      });

      let message;
      let type;
      try {
        await getERC20TokenInfo(mockProvider(), 'abc123');
      } catch (e:any) {
        message = e.message;
        type = e.type;
      }

      expect(message).toContain('Error getting name from contract');
      expect(type).toEqual(CheckoutErrorType.GET_ERC20_INFO_ERROR);
    });

    it('should throw an error if the contract address is invalid', async () => {
      (Contract as unknown as jest.Mock).mockImplementation(() => {
        const contract = jest.requireActual('ethers').Contract;
        // eslint-disable-next-line new-cap
        return new contract(mockProvider(), JSON.stringify(ERC20ABI), null);
      });

      let type;
      try {
        await getERC20TokenInfo(mockProvider(), 'abc123');
      } catch (e:any) {
        type = e.type;
      }

      expect(type).toEqual(CheckoutErrorType.GET_ERC20_INFO_ERROR);
    });
  });
});
