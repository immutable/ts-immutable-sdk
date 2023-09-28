import { Environment } from '@imtbl/config';
import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import {
  bridgeRoute,
  fetchL1Representation,
  getBridgeGasEstimate,
  hasSufficientL1Eth,
  isNativeEth,
} from './bridgeRoute';
import { CheckoutConfiguration } from '../../../config';
import {
  ChainId,
  FundingRouteType,
  ItemType,
} from '../../../types';
import { BalanceRequirement } from '../../balanceCheck/types';
import { TokenBalanceResult } from '../types';
import { createBlockchainDataInstance } from '../../../instance';
import { estimateGasForBridgeApproval } from './estimateApprovalGas';
import { bridgeGasEstimate } from './bridgeGasEstimate';
import { getImxL1Representation, INDEXER_ETH_ROOT_CONTRACT_ADDRESS } from './constants';
import { CheckoutErrorType } from '../../../errors';
import { allowListCheckForBridge } from '../../allowList/allowListCheck';

jest.mock('../../../gasEstimate');
jest.mock('../../../instance');
jest.mock('./estimateApprovalGas');
jest.mock('./bridgeGasEstimate');
jest.mock('./constants');
jest.mock('../../allowList/allowListCheck');

describe('bridgeRoute', () => {
  const config = new CheckoutConfiguration({
    baseConfig: { environment: Environment.SANDBOX },
  });

  const readonlyProviders = new Map<ChainId, JsonRpcProvider>([
    [ChainId.SEPOLIA, {} as JsonRpcProvider],
    [ChainId.IMTBL_ZKEVM_TESTNET, {} as JsonRpcProvider],
  ]);

  describe('bridgeRoute', () => {
    const feeEstimates = new Map<FundingRouteType, BigNumber>([
      [FundingRouteType.BRIDGE, BigNumber.from(1)],
    ]);

    describe('Bridge ETH ERC20', () => {
      const balanceRequirement: BalanceRequirement = {
        type: ItemType.ERC20,
        sufficient: false,
        delta: {
          balance: BigNumber.from(10),
          formattedBalance: '10',
        },
        current: {
          type: ItemType.ERC20,
          balance: BigNumber.from(0),
          formattedBalance: '0',
          token: {
            name: 'ETH-ERC20',
            symbol: 'ETH-ERC20',
            decimals: 18,
            address: '0x123',
          },
        },
        required: {
          type: ItemType.ERC20,
          balance: BigNumber.from(10),
          formattedBalance: '10',
          token: {
            name: 'ETH-ERC20',
            symbol: 'ETH-ERC20',
            decimals: 18,
            address: '0x123',
          },
        },
      };

      beforeEach(() => {
        (createBlockchainDataInstance as jest.Mock).mockReturnValue({
          getToken: jest.fn().mockResolvedValue({
            result: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              root_contract_address: INDEXER_ETH_ROOT_CONTRACT_ADDRESS,
            },
          }),
        });

        (estimateGasForBridgeApproval as jest.Mock).mockResolvedValue(BigNumber.from(0));
        (allowListCheckForBridge as jest.Mock).mockResolvedValue([
          {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
          },
        ]);
      });

      it('should return the bridge route if user has enough Ethereum & gas on L1', async () => {
        const balances = new Map<ChainId, TokenBalanceResult>([
          [ChainId.SEPOLIA, {
            success: true,
            balances: [
              {
                balance: BigNumber.from(20),
                formattedBalance: '20',
                token: {
                  name: 'Immutable X',
                  symbol: 'IMX',
                  decimals: 18,
                  address: '0xIMX',
                },
              },
              {
                balance: BigNumber.from(12),
                formattedBalance: '12',
                token: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
              },
            ],
          }],
        ]);

        const route = await bridgeRoute(
          config,
          readonlyProviders,
          '0xADDRESS',
          {
            bridge: true,
          },
          balanceRequirement,
          balances,
          feeEstimates,
        );

        expect(route).toEqual({
          type: FundingRouteType.BRIDGE,
          chainId: ChainId.SEPOLIA,
          asset: {
            balance: BigNumber.from(12),
            formattedBalance: '12',
            token: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
            },
          },
        });
      });

      it('should return the bridge route if user has exactly enough Ethereum & gas on L1', async () => {
        const balances = new Map<ChainId, TokenBalanceResult>([
          [ChainId.SEPOLIA, {
            success: true,
            balances: [
              {
                balance: BigNumber.from(11),
                formattedBalance: '11',
                token: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
              },
            ],
          }],
        ]);

        const route = await bridgeRoute(
          config,
          readonlyProviders,
          '0xADDRESS',
          {
            bridge: true,
          },
          balanceRequirement,
          balances,
          feeEstimates,
        );

        expect(route).toEqual({
          type: FundingRouteType.BRIDGE,
          chainId: ChainId.SEPOLIA,
          asset: {
            balance: BigNumber.from(11),
            formattedBalance: '11',
            token: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
            },
          },
        });
      });

      it('should not return bridge route if enough eth balance on L1 but not enough for gas', async () => {
        const balances = new Map<ChainId, TokenBalanceResult>([
          [ChainId.SEPOLIA, {
            success: true,
            balances: [
              {
                balance: BigNumber.from(10),
                formattedBalance: '10',
                token: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
              },
            ],
          }],
        ]);

        const route = await bridgeRoute(
          config,
          readonlyProviders,
          '0xADDRESS',
          {
            bridge: true,
          },
          balanceRequirement,
          balances,
          feeEstimates,
        );

        expect(route).toBeUndefined();
      });

      it('should not return bridge route if Ethereum is not on bridge allowlist', async () => {
        const balances = new Map<ChainId, TokenBalanceResult>([
          [ChainId.SEPOLIA, {
            success: true,
            balances: [
              {
                balance: BigNumber.from(20),
                formattedBalance: '20',
                token: {
                  name: 'Immutable X',
                  symbol: 'IMX',
                  decimals: 18,
                  address: '0xIMX',
                },
              },
              {
                balance: BigNumber.from(12),
                formattedBalance: '12',
                token: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
              },
            ],
          }],
        ]);
        (allowListCheckForBridge as jest.Mock).mockResolvedValue([]);

        const route = await bridgeRoute(
          config,
          readonlyProviders,
          '0xADDRESS',
          {
            bridge: true,
          },
          balanceRequirement,
          balances,
          feeEstimates,
        );

        expect(allowListCheckForBridge).toHaveBeenCalledTimes(1);
        expect(route).toEqual(undefined);
      });
    });

    describe('Bridge non-ETH ERC20', () => {
      const balanceRequirement: BalanceRequirement = {
        type: ItemType.ERC20,
        sufficient: false,
        delta: {
          balance: BigNumber.from(10),
          formattedBalance: '10',
        },
        current: {
          type: ItemType.ERC20,
          balance: BigNumber.from(0),
          formattedBalance: '0',
          token: {
            name: '0xERC20',
            symbol: '0xERC20',
            decimals: 18,
            address: '0x123',
          },
        },
        required: {
          type: ItemType.ERC20,
          balance: BigNumber.from(10),
          formattedBalance: '10',
          token: {
            name: '0xERC20',
            symbol: '0xERC20',
            decimals: 18,
            address: '0x123',
          },
        },
      };

      beforeEach(() => {
        (createBlockchainDataInstance as jest.Mock).mockReturnValue({
          getToken: jest.fn().mockResolvedValue({
            result: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              root_contract_address: '0xROOT_ADDRESS',
            },
          }),
        });

        (estimateGasForBridgeApproval as jest.Mock).mockResolvedValue(BigNumber.from(1));
        (allowListCheckForBridge as jest.Mock).mockResolvedValue([
          {
            address: '0xROOT_ADDRESS',
            name: '0xERC20',
            symbol: '0xERC20',
            decimals: 18,
          },
        ]);
      });

      it('should return the bridge route if user has enough ERC20 & gas on L1', async () => {
        const balances = new Map<ChainId, TokenBalanceResult>([
          [ChainId.SEPOLIA, {
            success: true,
            balances: [
              {
                balance: BigNumber.from(10),
                formattedBalance: '10',
                token: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
              },
              {
                balance: BigNumber.from(11),
                formattedBalance: '11',
                token: {
                  name: '0xERC20',
                  symbol: '0xERC20',
                  decimals: 18,
                  address: '0xROOT_ADDRESS',
                },
              },
            ],
          }],
        ]);

        const route = await bridgeRoute(
          config,
          readonlyProviders,
          '0xADDRESS',
          {
            bridge: true,
          },
          balanceRequirement,
          balances,
          feeEstimates,
        );

        expect(route).toEqual({
          type: FundingRouteType.BRIDGE,
          chainId: ChainId.SEPOLIA,
          asset: {
            balance: BigNumber.from(11),
            formattedBalance: '11',
            token: {
              name: '0xERC20',
              symbol: '0xERC20',
              address: '0xROOT_ADDRESS',
              decimals: 18,
            },
          },
        });
      });

      it('should return the bridge route if user has exactly enough ERC20 & gas on L1', async () => {
        const balances = new Map<ChainId, TokenBalanceResult>([
          [ChainId.SEPOLIA, {
            success: true,
            balances: [
              {
                balance: BigNumber.from(2),
                formattedBalance: '2',
                token: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
              },
              {
                balance: BigNumber.from(10),
                formattedBalance: '10',
                token: {
                  name: '0xERC20',
                  symbol: '0xERC20',
                  decimals: 18,
                  address: '0xROOT_ADDRESS',
                },
              },
            ],
          }],
        ]);

        const route = await bridgeRoute(
          config,
          readonlyProviders,
          '0xADDRESS',
          {
            bridge: true,
          },
          balanceRequirement,
          balances,
          feeEstimates,
        );

        expect(route).toEqual({
          type: FundingRouteType.BRIDGE,
          chainId: ChainId.SEPOLIA,
          asset: {
            balance: BigNumber.from(10),
            formattedBalance: '10',
            token: {
              name: '0xERC20',
              symbol: '0xERC20',
              address: '0xROOT_ADDRESS',
              decimals: 18,
            },
          },
        });
      });

      it('should return undefined if not enough ERC20 on L1', async () => {
        const balances = new Map<ChainId, TokenBalanceResult>([
          [ChainId.SEPOLIA, {
            success: true,
            balances: [
              {
                balance: BigNumber.from(2),
                formattedBalance: '2',
                token: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
              },
              {
                balance: BigNumber.from(9),
                formattedBalance: '9',
                token: {
                  name: '0xERC20',
                  symbol: '0xERC20',
                  decimals: 18,
                  address: '0xROOT_ADDRESS',
                },
              },
            ],
          }],
        ]);

        const route = await bridgeRoute(
          config,
          readonlyProviders,
          '0xADDRESS',
          {
            bridge: true,
          },
          balanceRequirement,
          balances,
          feeEstimates,
        );

        expect(route).toBeUndefined();
      });

      it('should return undefined if not enough ETH on L1 for gas', async () => {
        const balances = new Map<ChainId, TokenBalanceResult>([
          [ChainId.SEPOLIA, {
            success: true,
            balances: [
              {
                balance: BigNumber.from(1),
                formattedBalance: '1',
                token: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
              },
              {
                balance: BigNumber.from(10),
                formattedBalance: '10',
                token: {
                  name: '0xERC20',
                  symbol: '0xERC20',
                  decimals: 18,
                  address: '0xROOT_ADDRESS',
                },
              },
            ],
          }],
        ]);

        const route = await bridgeRoute(
          config,
          readonlyProviders,
          '0xADDRESS',
          {
            bridge: true,
          },
          balanceRequirement,
          balances,
          feeEstimates,
        );

        expect(route).toBeUndefined();
      });

      it('should not return bridge route if ERC20 is not on bridge allowlist', async () => {
        const balances = new Map<ChainId, TokenBalanceResult>([
          [ChainId.SEPOLIA, {
            success: true,
            balances: [
              {
                balance: BigNumber.from(10),
                formattedBalance: '10',
                token: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
              },
              {
                balance: BigNumber.from(11),
                formattedBalance: '11',
                token: {
                  name: '0xERC20',
                  symbol: '0xERC20',
                  decimals: 18,
                  address: '0xROOT_ADDRESS',
                },
              },
            ],
          }],
        ]);
        (allowListCheckForBridge as jest.Mock).mockResolvedValue([]);

        const route = await bridgeRoute(
          config,
          readonlyProviders,
          '0xADDRESS',
          {
            bridge: true,
          },
          balanceRequirement,
          balances,
          feeEstimates,
        );

        expect(allowListCheckForBridge).toHaveBeenCalledTimes(1);
        expect(route).toEqual(undefined);
      });
    });

    it('should return undefined if no balance on layer 1', async () => {
      const balanceRequirement: BalanceRequirement = {
        type: ItemType.ERC20,
        sufficient: false,
        delta: {
          balance: BigNumber.from(10),
          formattedBalance: '10',
        },
        current: {
          type: ItemType.ERC20,
          balance: BigNumber.from(0),
          formattedBalance: '0',
          token: {
            name: '0xERC20',
            symbol: '0xERC20',
            decimals: 18,
            address: '0x123',
          },
        },
        required: {
          type: ItemType.ERC20,
          balance: BigNumber.from(10),
          formattedBalance: '10',
          token: {
            name: '0xERC20',
            symbol: '0xERC20',
            decimals: 18,
            address: '0x123',
          },
        },
      };

      const balances = new Map<ChainId, TokenBalanceResult>([
        [ChainId.SEPOLIA, {
          success: true,
          balances: [],
        }],
      ]);

      const route = await bridgeRoute(
        config,
        readonlyProviders,
        '0xADDRESS',
        {
          bridge: true,
        },
        balanceRequirement,
        balances,
        feeEstimates,
      );

      expect(route).toBeUndefined();
    });

    it('should return undefined if no token balance result for L1', async () => {
      const balanceRequirement: BalanceRequirement = {
        type: ItemType.ERC20,
        sufficient: false,
        delta: {
          balance: BigNumber.from(10),
          formattedBalance: '10',
        },
        current: {
          type: ItemType.ERC20,
          balance: BigNumber.from(0),
          formattedBalance: '0',
          token: {
            name: '0xERC20',
            symbol: '0xERC20',
            decimals: 18,
            address: '0x123',
          },
        },
        required: {
          type: ItemType.ERC20,
          balance: BigNumber.from(10),
          formattedBalance: '10',
          token: {
            name: '0xERC20',
            symbol: '0xERC20',
            decimals: 18,
            address: '0x123',
          },
        },
      };

      const balances = new Map<ChainId, TokenBalanceResult>([
        [ChainId.IMTBL_ZKEVM_TESTNET, {
          success: true,
          balances: [],
        }],
      ]);

      const route = await bridgeRoute(
        config,
        readonlyProviders,
        '0xADDRESS',
        {
          bridge: true,
        },
        balanceRequirement,
        balances,
        feeEstimates,
      );

      expect(route).toEqual(undefined);
    });

    it('should return undefined if token balance returned unsuccessful on L1', async () => {
      const balanceRequirement: BalanceRequirement = {
        type: ItemType.ERC20,
        sufficient: false,
        delta: {
          balance: BigNumber.from(10),
          formattedBalance: '10',
        },
        current: {
          type: ItemType.ERC20,
          balance: BigNumber.from(0),
          formattedBalance: '0',
          token: {
            name: '0xERC20',
            symbol: '0xERC20',
            decimals: 18,
            address: '0x123',
          },
        },
        required: {
          type: ItemType.ERC20,
          balance: BigNumber.from(10),
          formattedBalance: '10',
          token: {
            name: '0xERC20',
            symbol: '0xERC20',
            decimals: 18,
            address: '0x123',
          },
        },
      };

      const balances = new Map<ChainId, TokenBalanceResult>([
        [ChainId.SEPOLIA, {
          success: false,
          balances: [],
        }],
      ]);

      const route = await bridgeRoute(
        config,
        readonlyProviders,
        '0xADDRESS',
        {
          bridge: true,
        },
        balanceRequirement,
        balances,
        feeEstimates,
      );

      expect(route).toEqual(undefined);
    });

    it('should throw error if readonly providers missing L1', async () => {
      const balanceRequirement: BalanceRequirement = {
        type: ItemType.ERC20,
        sufficient: false,
        delta: {
          balance: BigNumber.from(10),
          formattedBalance: '10',
        },
        current: {
          type: ItemType.ERC20,
          balance: BigNumber.from(0),
          formattedBalance: '0',
          token: {
            name: '0xERC20',
            symbol: '0xERC20',
            decimals: 18,
            address: '0x123',
          },
        },
        required: {
          type: ItemType.ERC20,
          balance: BigNumber.from(10),
          formattedBalance: '10',
          token: {
            name: '0xERC20',
            symbol: '0xERC20',
            decimals: 18,
            address: '0x123',
          },
        },
      };

      const balances = new Map<ChainId, TokenBalanceResult>([
        [ChainId.SEPOLIA, {
          success: true,
          balances: [],
        }],
      ]);

      let type;
      let data;

      try {
        await bridgeRoute(
          config,
          new Map<ChainId, JsonRpcProvider>([
            [ChainId.IMTBL_ZKEVM_TESTNET, {} as JsonRpcProvider],
          ]),
          '0xADDRESS',
          {
            bridge: true,
          },
          balanceRequirement,
          balances,
          feeEstimates,
        );
      } catch (err: any) {
        type = err.type;
        data = err.data;
      }

      expect(type).toEqual(CheckoutErrorType.PROVIDER_ERROR);
      expect(data).toEqual({ chainId: ChainId.SEPOLIA.toString() });
    });
  });

  describe('hasSufficientL1Eth', () => {
    it('should return true if enough eth', () => {
      const hasSufficientEth = hasSufficientL1Eth(
        {
          success: true,
          balances: [
            {
              balance: BigNumber.from(2),
              formattedBalance: '2',
              token: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
              },
            },
          ],
        },
        BigNumber.from(1),
      );

      expect(hasSufficientEth).toBeTruthy();
    });

    it('should return true if exactly enough eth', () => {
      const hasSufficientEth = hasSufficientL1Eth(
        {
          success: true,
          balances: [
            {
              balance: BigNumber.from(1),
              formattedBalance: '1',
              token: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
              },
            },
          ],
        },
        BigNumber.from(1),
      );

      expect(hasSufficientEth).toBeTruthy();
    });

    it('should return false if not enough eth', () => {
      const hasSufficientEth = hasSufficientL1Eth(
        {
          success: true,
          balances: [
            {
              balance: BigNumber.from(0),
              formattedBalance: '0',
              token: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
              },
            },
          ],
        },
        BigNumber.from(1),
      );

      expect(hasSufficientEth).toBeFalsy();
    });
  });

  describe('fetchL1Representation', () => {
    it('should fetch L1 representation of ERC20', async () => {
      const balanceRequirement: BalanceRequirement = {
        type: ItemType.ERC20,
        sufficient: false,
        delta: {
          balance: BigNumber.from(10),
          formattedBalance: '10',
        },
        current: {
          type: ItemType.ERC20,
          balance: BigNumber.from(0),
          formattedBalance: '0',
          token: {
            name: '0xERC20',
            symbol: '0xERC20',
            decimals: 18,
            address: '0x123',
          },
        },
        required: {
          type: ItemType.ERC20,
          balance: BigNumber.from(10),
          formattedBalance: '10',
          token: {
            name: '0xERC20',
            symbol: '0xERC20',
            decimals: 18,
            address: '0x123',
          },
        },
      };

      (createBlockchainDataInstance as jest.Mock).mockReturnValue({
        getToken: jest.fn().mockResolvedValue({
          result: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            root_contract_address: '0xROOT_ADDRESS',
          },
        }),
      });

      const l1Address = await fetchL1Representation(
        config,
        balanceRequirement,
      );

      expect(l1Address).toEqual('0xROOT_ADDRESS');
    });

    it('should fetch L1 representation of NATIVE', async () => {
      const balanceRequirement: BalanceRequirement = {
        type: ItemType.NATIVE,
        sufficient: false,
        delta: {
          balance: BigNumber.from(10),
          formattedBalance: '10',
        },
        current: {
          type: ItemType.NATIVE,
          balance: BigNumber.from(0),
          formattedBalance: '0',
          token: {
            name: '0xNATIVE',
            symbol: '0xNATIVE',
            decimals: 18,
          },
        },
        required: {
          type: ItemType.NATIVE,
          balance: BigNumber.from(10),
          formattedBalance: '10',
          token: {
            name: '0xNATIVE',
            symbol: '0xNATIVE',
            decimals: 18,
          },
        },
      };
      (getImxL1Representation as jest.Mock).mockResolvedValue('0x2Fa06C6672dDCc066Ab04631192738799231dE4a');
      (createBlockchainDataInstance as jest.Mock).mockReturnValue({
        getToken: jest.fn().mockResolvedValue({}),
      });

      const l1Address = await fetchL1Representation(
        config,
        balanceRequirement,
      );

      expect(l1Address).toEqual('0x2Fa06C6672dDCc066Ab04631192738799231dE4a');
      expect(createBlockchainDataInstance).not.toHaveBeenCalled();
    });

    it('should return empty string if indexer returns null', async () => {
      const balanceRequirement: BalanceRequirement = {
        type: ItemType.ERC20,
        sufficient: false,
        delta: {
          balance: BigNumber.from(10),
          formattedBalance: '10',
        },
        current: {
          type: ItemType.ERC20,
          balance: BigNumber.from(0),
          formattedBalance: '0',
          token: {
            name: '0xERC20',
            symbol: '0xERC20',
            decimals: 18,
            address: '0x123',
          },
        },
        required: {
          type: ItemType.ERC20,
          balance: BigNumber.from(10),
          formattedBalance: '10',
          token: {
            name: '0xERC20',
            symbol: '0xERC20',
            decimals: 18,
            address: '0x123',
          },
        },
      };

      (createBlockchainDataInstance as jest.Mock).mockReturnValue({
        getToken: jest.fn().mockResolvedValue({
          result: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            root_contract_address: null,
          },
        }),
      });

      const l1Address = await fetchL1Representation(
        config,
        balanceRequirement,
      );

      expect(l1Address).toEqual('');
    });

    it('should return empty string if no address in ERC20 requirement', async () => {
      const balanceRequirement: BalanceRequirement = {
        type: ItemType.ERC20,
        sufficient: false,
        delta: {
          balance: BigNumber.from(10),
          formattedBalance: '10',
        },
        current: {
          type: ItemType.ERC20,
          balance: BigNumber.from(0),
          formattedBalance: '0',
          token: {
            name: '0xERC20',
            symbol: '0xERC20',
            decimals: 18,
          },
        },
        required: {
          type: ItemType.ERC20,
          balance: BigNumber.from(10),
          formattedBalance: '10',
          token: {
            name: '0xERC20',
            symbol: '0xERC20',
            decimals: 18,
          },
        },
      };

      (createBlockchainDataInstance as jest.Mock).mockReturnValue({
        getToken: jest.fn().mockResolvedValue({
          result: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            root_contract_address: '0xROOT_ADDRESS',
          },
        }),
      });

      const l1Address = await fetchL1Representation(
        config,
        balanceRequirement,
      );

      expect(l1Address).toEqual('');
      expect(createBlockchainDataInstance).not.toHaveBeenCalled();
    });

    it('should return empty string if ERC721 requirement', async () => {
      const balanceRequirement: BalanceRequirement = {
        type: ItemType.ERC721,
        sufficient: false,
        delta: {
          balance: BigNumber.from(10),
          formattedBalance: '10',
        },
        current: {
          type: ItemType.ERC721,
          balance: BigNumber.from(0),
          formattedBalance: '0',
          id: '0',
          contractAddress: '0xERC721',
        },
        required: {
          type: ItemType.ERC721,
          balance: BigNumber.from(10),
          formattedBalance: '10',
          id: '0',
          contractAddress: '0xERC721',
        },
      };

      (createBlockchainDataInstance as jest.Mock).mockReturnValue({
        getToken: jest.fn().mockResolvedValue({
          result: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            root_contract_address: '0xROOT_ADDRESS',
          },
        }),
      });

      const l1Address = await fetchL1Representation(
        config,
        balanceRequirement,
      );

      expect(l1Address).toEqual('');
      expect(createBlockchainDataInstance).not.toHaveBeenCalled();
    });
  });

  describe('getBridgeGasEstimate', () => {
    it('should get from cache if already fetched', async () => {
      (bridgeGasEstimate as jest.Mock).mockResolvedValue(BigNumber.from(1));

      const feeEstimates = new Map<FundingRouteType, BigNumber>([
        [FundingRouteType.BRIDGE, BigNumber.from(1)],
      ]);

      const bridgeFeeEstimate = await getBridgeGasEstimate(
        config,
        readonlyProviders,
        feeEstimates,
      );

      expect(bridgeFeeEstimate).toEqual(BigNumber.from(1));
      expect(bridgeGasEstimate).not.toHaveBeenCalled();
    });

    it('should fetch from cache if not already cached and set in cache', async () => {
      (bridgeGasEstimate as jest.Mock).mockResolvedValue(BigNumber.from(1));

      const feeEstimates = new Map<FundingRouteType, BigNumber>([]);

      const bridgeFeeEstimate = await getBridgeGasEstimate(
        config,
        readonlyProviders,
        feeEstimates,
      );

      expect(bridgeFeeEstimate).toEqual(BigNumber.from(1));
      expect(bridgeGasEstimate).toHaveBeenCalledTimes(1);
      expect(feeEstimates).toEqual(new Map<FundingRouteType, BigNumber>([
        [FundingRouteType.BRIDGE, BigNumber.from(1)],
      ]));
    });
  });

  describe('isNativeEth', () => {
    it('should return true if address empty string', () => {
      expect(isNativeEth('')).toBeTruthy();
    });

    it('should return true if address undefined', () => {
      expect(isNativeEth(undefined)).toBeTruthy();
    });

    it('should return false if address exists', () => {
      expect(isNativeEth('0xERC20')).toBeFalsy();
    });
  });
});
