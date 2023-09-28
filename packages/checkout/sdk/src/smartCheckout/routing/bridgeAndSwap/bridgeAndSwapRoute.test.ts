import { Environment } from '@imtbl/config';
import { BigNumber } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Quote } from '@imtbl/dex-sdk';
import { CheckoutConfiguration } from '../../../config';
import {
  ChainId,
  FundingRouteType,
  ItemType,
  TokenInfo,
} from '../../../types';
import { BalanceCheckResult, BalanceERC20Requirement } from '../../balanceCheck/types';
import {
  DexQuote, DexQuotes, TokenBalanceResult,
} from '../types';
import { bridgeAndSwapRoute } from './bridgeAndSwapRoute';
import { fetchL1ToL2Mappings } from './fetchL1ToL2Mappings';
import { bridgeRoute } from '../bridge/bridgeRoute';
import { swapRoute } from '../swap/swapRoute';
import { getDexQuotes } from './getDexQuotes';
import { constructBridgeRequirements } from './constructBridgeRequirements';
import { INDEXER_ETH_ROOT_CONTRACT_ADDRESS } from '../indexer/fetchL1Representation';

jest.mock('./fetchL1ToL2Mappings');
jest.mock('./getDexQuotes');
jest.mock('../bridge/bridgeRoute');
jest.mock('../swap/swapRoute');
jest.mock('./constructBridgeRequirements');

describe('bridgeAndSwapRoute', () => {
  const config = new CheckoutConfiguration({
    baseConfig: { environment: Environment.SANDBOX },
  });

  const readonlyProviders = new Map<ChainId, JsonRpcProvider>([
    [ChainId.SEPOLIA, {} as JsonRpcProvider],
    [ChainId.IMTBL_ZKEVM_TESTNET, {} as JsonRpcProvider],
  ]);

  const availableRoutingOptions = {
    bridge: true,
    swap: true,
  };

  const feeEstimates = new Map<FundingRouteType, BigNumber>([
    [FundingRouteType.BRIDGE, BigNumber.from(1)],
  ]);

  const tokenBalances = new Map<ChainId, TokenBalanceResult>([
    [ChainId.IMTBL_ZKEVM_TESTNET, {
      success: true,
      balances: [
        {
          balance: BigNumber.from(5),
          formattedBalance: '5',
          token: {
            name: 'zkYEET',
            symbol: 'YEET',
            decimals: 18,
            address: '0xYEET',
          },
        },
        {
          balance: BigNumber.from(10),
          formattedBalance: '10',
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
            address: '0xIMX',
          },
        },
      ],
    }],
    [ChainId.SEPOLIA, {
      success: true,
      balances: [
        {
          balance: BigNumber.from(10),
          formattedBalance: '10',
          token: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
        },
        {
          balance: BigNumber.from(10),
          formattedBalance: '10',
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
            address: '0xIMXL1',
          },
        },
      ],
    }],
  ]);

  const ownerAddress = '0xOWNER';

  const getTestDexQuotes = (): DexQuotes => {
    const dexQuotes = new Map<string, DexQuote>([]);
    const dexQuoteIMX: DexQuote = {
      quote: {
        amount: {
          value: BigNumber.from(10),
          token: {
            address: '0xYEET',
          } as TokenInfo,
        },
        amountWithMaxSlippage: {
          value: BigNumber.from(15),
          token: {
            address: '0xIMX',
          } as TokenInfo,
        },
        slippage: 1,
        fees: [
          {
            amount: {
              value: BigNumber.from(5),
              token: {
                address: '0xIMX',
              } as TokenInfo,
            },
            recipient: '',
            basisPoints: 0,
          },
        ],
      } as Quote,
      approval: undefined,
      swap: null,
    };
    const dexQuoteETH: DexQuote = {
      quote: {
        amount: {
          value: BigNumber.from(10),
          token: {
            address: '0xYEET',
          } as TokenInfo,
        },
        amountWithMaxSlippage: {
          value: BigNumber.from(15),
          token: {
            address: '0xETH',
          } as TokenInfo,
        },
        slippage: 1,
        fees: [
          {
            amount: {
              value: BigNumber.from(5),
              token: {
                address: '0xETH',
              } as TokenInfo,
            },
            recipient: '',
            basisPoints: 0,
          },
        ],
      } as Quote,
      approval: undefined,
      swap: null,
    };

    dexQuotes.set('0xIMX', dexQuoteIMX);
    dexQuotes.set('0xETH', dexQuoteETH);
    return dexQuotes;
  };

  const getTestDexQuoteCache = (): Map<string, DexQuotes> => {
    const dexQuoteCache = new Map<string, DexQuotes>([]);
    const dexQuotes = getTestDexQuotes();

    dexQuoteCache.set('0xYEET', dexQuotes);

    return dexQuoteCache;
  };

  it('should return bridge and swap routes', async () => {
    (fetchL1ToL2Mappings as jest.Mock).mockResolvedValue(
      [
        {
          l1address: '0xIMXL1',
          l2address: '0xIMX',
        },
        {
          l1address: INDEXER_ETH_ROOT_CONTRACT_ADDRESS,
          l2address: '0xETH',
        },
      ],
    );
    (getDexQuotes as jest.Mock).mockResolvedValue(getTestDexQuotes());
    (bridgeRoute as jest.Mock)
      .mockResolvedValueOnce(
        {
          type: FundingRouteType.BRIDGE,
          chainId: ChainId.SEPOLIA,
          asset: {
            balance: BigNumber.from(5),
            formattedBalance: '5',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
              address: '0xIMXL1',
            },
          },
        },
      )
      .mockResolvedValueOnce(
        {
          type: FundingRouteType.BRIDGE,
          chainId: ChainId.SEPOLIA,
          asset: {
            balance: BigNumber.from(10),
            formattedBalance: '10',
            token: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
          },
        },
      );
    (swapRoute as jest.Mock).mockResolvedValue(
      [
        {
          type: FundingRouteType.SWAP,
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          asset: {
            balance: BigNumber.from(5),
            formattedBalance: '5',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
              address: '0xIMX',
            },
          },
        },
        {
          type: FundingRouteType.SWAP,
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          asset: {
            balance: BigNumber.from(5),
            formattedBalance: '5',
            token: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
              address: '0xETH',
            },
          },
        },
      ],
    );
    (constructBridgeRequirements as jest.Mock).mockReturnValue(
      [
        {
          amount: BigNumber.from(10),
          formattedAmount: '10',
          l2address: '0xIMX',
        },
        {
          amount: BigNumber.from(10),
          formattedAmount: '10',
          l2address: '0xETH',
        },
      ],
    );

    const insufficientRequirement: BalanceERC20Requirement = {
      type: ItemType.ERC20,
      sufficient: false,
      delta: {
        balance: BigNumber.from(5),
        formattedBalance: '5',
      },
      current: {
        type: ItemType.ERC20,
        balance: BigNumber.from(5),
        formattedBalance: '5',
        token: {
          address: '0xYEET',
          decimals: 18,
          name: 'zkYEET',
          symbol: 'YEET',
        } as TokenInfo,
      },
      required: {
        type: ItemType.ERC20,
        balance: BigNumber.from(10),
        formattedBalance: '10',
        token: {
          address: '0xYEET',
          decimals: 18,
          name: 'zkYEET',
          symbol: 'YEET',
        } as TokenInfo,
      },
    };

    const bridgeableTokens: string[] = [INDEXER_ETH_ROOT_CONTRACT_ADDRESS, '0xIMXL1'];
    const swappableTokens: TokenInfo[] = [
      {
        address: '0xYEET',
        decimals: 18,
        name: 'zkYEET',
        symbol: 'YEET',
      },
      {
        address: '0xIMX',
        decimals: 18,
        name: 'IMX',
        symbol: 'IMX',
      },
      {
        address: '0xETH',
        decimals: 18,
        name: 'ETH',
        symbol: 'ETH',
      },
    ];

    const balanceRequirements = {
      sufficient: false,
      balanceRequirements: [],
    } as BalanceCheckResult;

    const result = await bridgeAndSwapRoute(
      config,
      readonlyProviders,
      availableRoutingOptions,
      insufficientRequirement,
      getTestDexQuoteCache(),
      ownerAddress,
      feeEstimates,
      tokenBalances,
      bridgeableTokens,
      swappableTokens,
      balanceRequirements,
    );

    expect(result).toEqual(
      [
        {
          bridgeFundingStep: {
            type: FundingRouteType.BRIDGE,
            chainId: ChainId.SEPOLIA,
            asset: {
              balance: BigNumber.from(5),
              formattedBalance: '5',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0xIMXL1',
              },
            },
          },
          swapFundingStep: {
            type: FundingRouteType.SWAP,
            chainId: ChainId.IMTBL_ZKEVM_TESTNET,
            asset: {
              balance: BigNumber.from(10),
              formattedBalance: '10',
              token: {
                name: 'IMX',
                symbol: 'IMX',
                decimals: 18,
                address: '0xIMX',
              },
            },
          },
        },
        {
          bridgeFundingStep: {
            type: FundingRouteType.BRIDGE,
            chainId: ChainId.SEPOLIA,
            asset: {
              balance: BigNumber.from(10),
              formattedBalance: '10',
              token: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
            },
          },
          swapFundingStep: {
            type: FundingRouteType.SWAP,
            chainId: ChainId.IMTBL_ZKEVM_TESTNET,
            asset: {
              balance: BigNumber.from(0),
              formattedBalance: '0',
              token: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
                address: '0xETH',
              },
            },
          },
        },
      ],
    );
  });

  it('should return no bridge and swap routes', async () => {
    const insufficientRequirement: BalanceERC20Requirement = {
      type: ItemType.ERC20,
      sufficient: false,
      delta: {
        balance: BigNumber.from(5),
        formattedBalance: '5',
      },
      current: {
        type: ItemType.ERC20,
        balance: BigNumber.from(5),
        formattedBalance: '5',
        token: {
          address: '0xIMX',
          decimals: 18,
          name: 'zkYEET',
          symbol: 'YEET',
        } as TokenInfo,
      },
      required: {
        type: ItemType.ERC20,
        balance: BigNumber.from(10),
        formattedBalance: '10',
        token: {
          address: '0xIMX',
          decimals: 18,
          name: 'zkYEET',
          symbol: 'YEET',
        } as TokenInfo,
      },
    };

    const bridgeableTokens: string[] = [];
    const swappableTokens: TokenInfo[] = [];

    const balanceRequirements = {} as BalanceCheckResult;

    const result = await bridgeAndSwapRoute(
      config,
      readonlyProviders,
      availableRoutingOptions,
      insufficientRequirement,
      getTestDexQuoteCache(),
      ownerAddress,
      feeEstimates,
      tokenBalances,
      bridgeableTokens,
      swappableTokens,
      balanceRequirements,
    );

    expect(result).toEqual([]);
  });
});
