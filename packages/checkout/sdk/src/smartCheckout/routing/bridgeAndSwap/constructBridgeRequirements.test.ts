import { Token as DexTokenInfo } from '@imtbl/dex-sdk';
import { DexQuote } from '../types';
import {
  ChainId,
  GetBalanceResult,
  ItemType,
  TokenInfo,
} from '../../../types';
import {
  constructBridgeRequirements,
  getAmountFromBalanceRequirement,
  getAmountToBridge,
} from './constructBridgeRequirements';
import { BalanceRequirement } from '../../balanceCheck/types';
import { INDEXER_ETH_ROOT_CONTRACT_ADDRESS } from '../indexer/fetchL1Representation';

describe('constructBridgeRequirements', () => {
  const constructDexQuote = (
    swapTokenInfo: DexTokenInfo,
    feesTokenInfo: DexTokenInfo,
    quoteAmount: number,
    slippageQuoteAmount: number,
    feeAmount: number,
    swap?: number,
    approval?: number,
  ) => {
    const dexQuote: DexQuote = {
      approval: null,
      swap: null,
      quote: {
        amount: {
          value: BigInt(quoteAmount),
          token: swapTokenInfo,
        },
        amountWithMaxSlippage: {
          value: BigInt(slippageQuoteAmount),
          token: swapTokenInfo,
        },
        slippage: 1,
        fees: [
          {
            amount: {
              value: BigInt(feeAmount),
              token: feesTokenInfo,
            },
            recipient: '',
            basisPoints: 0,
          },
        ],
      },
    };

    if (swap) {
      dexQuote.swap = {
        value: BigInt(swap),
        token: swapTokenInfo,
      };
    }

    if (approval) {
      dexQuote.approval = {
        value: BigInt(approval),
        token: feesTokenInfo,
      };
    }

    return dexQuote;
  };

  it('should construct the bridge requirements', () => {
    const swapTokenInfoA: DexTokenInfo = {
      chainId: 1,
      address: '0xERC20A',
      decimals: 18,
      symbol: 'ERC20',
      name: 'ERC20',
    };

    const swapTokenInfoB: DexTokenInfo = {
      chainId: ChainId.IMTBL_ZKEVM_TESTNET,
      address: '0xERC20B',
      decimals: 18,
      symbol: 'ERC20',
      name: 'ERC20',
    };

    const feesTokenInfo: DexTokenInfo = {
      chainId: ChainId.IMTBL_ZKEVM_TESTNET,
      address: '0xERC20',
      decimals: 18,
      symbol: 'ERC20',
      name: 'ERC20',
    };

    const dexQuoteA = constructDexQuote(
      swapTokenInfoA,
      feesTokenInfo,
      100000000000000,
      200000000000000,
      300000000000000,
      400000000000000,
      500000000000000,
    );

    const dexQuoteB = constructDexQuote(
      swapTokenInfoB,
      feesTokenInfo,
      600000000000000,
      700000000000000,
      800000000000000,
      900000000000000,
      110000000000000,
    );

    const dexQuotes = new Map<string, DexQuote>([
      ['0xERC20A', dexQuoteA],
      ['0xERC20B', dexQuoteB],
    ]);

    const l1balances: GetBalanceResult[] = [
      {
        token: {
          address: 'ERC20AL1',
          decimals: 18,
        } as TokenInfo,
        balance: BigInt(5000000000000000),
        formattedBalance: '5',
      },
      {
        token: {
          address: 'ERC20BL1',
          decimals: 18,
        } as TokenInfo,
        balance: BigInt(6000000000000000),
        formattedBalance: '6',
      },
    ];

    const l2balances: GetBalanceResult[] = [];

    const requirements = constructBridgeRequirements(
      dexQuotes,
      l1balances,
      l2balances,
      [
        {
          l1address: 'ERC20AL1',
          l2address: '0xERC20A',
        },
        {
          l1address: 'ERC20BL1',
          l2address: '0xERC20B',
        },
      ],
      {
        sufficient: false,
        balanceRequirements: [
          {
            type: ItemType.ERC20,
            sufficient: false,
            required: {
              type: ItemType.ERC20,
              balance: BigInt(1),
              formattedBalance: '1',
              token: {
                address: '0xERC20C',
              } as TokenInfo,
            },
          },
        ] as BalanceRequirement[],
      },
    );

    expect(requirements).toEqual(
      [
        {
          amount: BigInt(200000000000000),
          formattedAmount: '0.0002',
          l2address: '0xERC20A',
        },
        {
          amount: BigInt(700000000000000),
          formattedAmount: '0.0007',
          l2address: '0xERC20B',
        },
      ],
    );
  });

  it('should handle native L1', () => {
    const swapTokenETH: DexTokenInfo = {
      chainId: ChainId.IMTBL_ZKEVM_TESTNET,
      address: '0xETH',
      decimals: 18,
      symbol: 'ETH',
      name: 'ETH',
    };

    const feesTokenInfo: DexTokenInfo = {
      chainId: ChainId.IMTBL_ZKEVM_TESTNET,
      address: '0xIMX',
      decimals: 18,
      symbol: 'IMX',
      name: 'IMX',
    };

    const ethDexQuote = constructDexQuote(
      swapTokenETH,
      feesTokenInfo,
      100000000000000,
      200000000000000,
      300000000000000,
      400000000000000,
      500000000000000,
    );

    const dexQuotes = new Map<string, DexQuote>([
      ['0xETH', ethDexQuote],
    ]);

    const l1balances: GetBalanceResult[] = [
      {
        token: {
          decimals: 18,
        } as TokenInfo,
        balance: BigInt(300000000000000),
        formattedBalance: '3',
      },
    ];

    const l2balances: GetBalanceResult[] = [];

    const requirements = constructBridgeRequirements(
      dexQuotes,
      l1balances,
      l2balances,
      [
        {
          l1address: INDEXER_ETH_ROOT_CONTRACT_ADDRESS,
          l2address: '0xETH',
        },
      ],
      {
        sufficient: false,
        balanceRequirements: [
          {
            type: ItemType.ERC20,
            sufficient: false,
            required: {
              type: ItemType.ERC20,
              balance: BigInt(1),
              formattedBalance: '1',
              token: {
                address: '0xERC',
              } as TokenInfo,
            },
          },
        ] as BalanceRequirement[],
      },
    );

    expect(requirements).toEqual(
      [
        {
          amount: BigInt(200000000000000),
          formattedAmount: '0.0002',
          l2address: '0xETH',
        },
      ],
    );
  });

  it('should not return bridge requirement if not enough balance on l1', () => {
    const swapTokenInfoA: DexTokenInfo = {
      chainId: 1,
      address: '0xERC20A',
      decimals: 18,
      symbol: 'ERC20',
      name: 'ERC20',
    };

    const swapTokenInfoB: DexTokenInfo = {
      chainId: ChainId.IMTBL_ZKEVM_TESTNET,
      address: '0xERC20B',
      decimals: 18,
      symbol: 'ERC20',
      name: 'ERC20',
    };

    const feesTokenInfo: DexTokenInfo = {
      chainId: ChainId.IMTBL_ZKEVM_TESTNET,
      address: '0xERC20',
      decimals: 18,
      symbol: 'ERC20',
      name: 'ERC20',
    };

    const dexQuoteA = constructDexQuote(
      swapTokenInfoA,
      feesTokenInfo,
      100000000000000,
      200000000000000,
      300000000000000,
      400000000000000,
      500000000000000,
    );

    const dexQuoteB = constructDexQuote(
      swapTokenInfoB,
      feesTokenInfo,
      600000000000000,
      700000000000000,
      800000000000000,
      900000000000000,
      110000000000000,
    );

    const dexQuotes = new Map<string, DexQuote>([
      ['0xERC20A', dexQuoteA],
      ['0xERC20B', dexQuoteB],
    ]);

    const l1balances: GetBalanceResult[] = [
      {
        token: {
          address: 'ERC20AL1',
          decimals: 18,
        } as TokenInfo,
        balance: BigInt(500000000000000),
        formattedBalance: '1',
      },
      {
        token: {
          address: 'ERC20BL1',
          decimals: 18,
        } as TokenInfo,
        // Not enough balance to bridge this ERC20
        balance: BigInt(100000000000000),
        formattedBalance: '1',
      },
    ];

    const l2balances: GetBalanceResult[] = [];

    const requirements = constructBridgeRequirements(
      dexQuotes,
      l1balances,
      l2balances,
      [
        {
          l1address: 'ERC20AL1',
          l2address: '0xERC20A',
        },
        {
          l1address: 'ERC20BL1',
          l2address: '0xERC20B',
        },
      ],
      {
        sufficient: false,
        balanceRequirements: [
          {
            type: ItemType.ERC20,
            sufficient: false,
            required: {
              type: ItemType.ERC20,
              balance: BigInt(1),
              formattedBalance: '1',
              token: {
                address: '0xERC20C',
              } as TokenInfo,
            },
          },
        ] as BalanceRequirement[],
      },
    );

    expect(requirements).toEqual(
      [
        {
          amount: BigInt(200000000000000),
          formattedAmount: '0.0002',
          l2address: '0xERC20A',
        },
      ],
    );
  });

  it('should add fees and balance requirement if they are same as token address and remove l2 balance', () => {
    const swapTokenInfo: DexTokenInfo = {
      chainId: 1,
      address: '0xIMX',
      decimals: 18,
      symbol: '0xIMX',
      name: '0xIMX',
    };

    const feesTokenInfo: DexTokenInfo = {
      chainId: ChainId.IMTBL_ZKEVM_TESTNET,
      address: '0xIMX',
      decimals: 18,
      symbol: '0xIMX',
      name: '0xIMX',
    };

    const dexQuote = constructDexQuote(
      swapTokenInfo,
      feesTokenInfo,
      100000000000000,
      200000000000000,
      300000000000000,
      400000000000000,
      500000000000000,
    );

    const dexQuotes = new Map<string, DexQuote>([
      ['0xIMX', dexQuote],
    ]);

    const l1balances: GetBalanceResult[] = [
      {
        token: {
          address: '0xIMXL1',
          decimals: 18,
        } as TokenInfo,
        balance: BigInt(5000000000000000),
        formattedBalance: '5',
      },
    ];

    const l2balances: GetBalanceResult[] = [
      {
        token: {
          address: '0xIMX',
          decimals: 18,
        } as TokenInfo,
        balance: BigInt(10000000000000),
        formattedBalance: '0.1',
      },
    ];

    const requirements = constructBridgeRequirements(
      dexQuotes,
      l1balances,
      l2balances,
      [
        {
          l1address: '0xIMXL1',
          l2address: '0xIMX',
        },
      ],
      {
        sufficient: false,
        balanceRequirements: [
          {
            type: ItemType.NATIVE,
            sufficient: false,
            required: {
              type: ItemType.NATIVE,
              balance: BigInt(120000000000000),
              formattedBalance: '1',
              token: {
                address: '0xIMX',
              } as TokenInfo,
            },
          },
        ] as BalanceRequirement[],
      },
    );

    expect(requirements).toEqual(
      [
        {
          amount: BigInt(1110000000000000),
          formattedAmount: '0.00111',
          l2address: '0xIMX',
        },
      ],
    );
  });

  it('should not return a requirement if amount to bridge is 0 due to sufficient l2 balance', () => {
    const swapTokenInfo: DexTokenInfo = {
      chainId: 1,
      address: '0xL2',
      decimals: 18,
      symbol: '0xL2',
      name: '0xL2',
    };

    const feesTokenInfo: DexTokenInfo = {
      chainId: ChainId.IMTBL_ZKEVM_TESTNET,
      address: '0xIMX',
      decimals: 18,
      symbol: '0xIMX',
      name: '0xIMX',
    };

    const dexQuote = constructDexQuote(
      swapTokenInfo,
      feesTokenInfo,
      100000000000000,
      200000000000000,
      300000000000000,
      400000000000000,
      500000000000000,
    );

    const dexQuotes = new Map<string, DexQuote>([
      ['0xL2', dexQuote],
    ]);

    const l1balances: GetBalanceResult[] = [
      {
        token: {
          address: '0xL1',
          decimals: 18,
        } as TokenInfo,
        balance: BigInt(100000000000000),
        formattedBalance: '1',
      },
    ];

    const l2balances: GetBalanceResult[] = [
      {
        token: {
          address: '0xL2',
          decimals: 18,
        } as TokenInfo,
        balance: BigInt(9000000000000000),
        formattedBalance: '1',
      },
    ];

    const requirements = constructBridgeRequirements(
      dexQuotes,
      l1balances,
      l2balances,
      [
        {
          l1address: '0xL1',
          l2address: '0xL2',
        },
      ],
      {
        sufficient: false,
        balanceRequirements: [] as BalanceRequirement[],
      },
    );

    expect(requirements).toEqual([]);
  });

  describe('getAmountFromBalanceRequirement', () => {
    it('should get amount from balance requirement if quoted token is a balance requirement', () => {
      const balanceRequirements = {
        sufficient: false,
        balanceRequirements: [
          {
            type: ItemType.ERC20,
            sufficient: false,
            required: {
              type: ItemType.ERC20,
              balance: BigInt(1),
              formattedBalance: '1',
              token: {
                address: '0xERC20',
              } as TokenInfo,
            },
          },
        ] as BalanceRequirement[],
      };

      const amount = getAmountFromBalanceRequirement(balanceRequirements, '0xERC20');
      expect(amount).toEqual(BigInt(1));
    });

    it('should return 0 if quoted token is not a balance requirement', () => {
      const balanceRequirements = {
        sufficient: false,
        balanceRequirements: [
          {
            type: ItemType.ERC20,
            sufficient: false,
            required: {
              type: ItemType.ERC20,
              balance: BigInt(1),
              formattedBalance: '1',
              token: {
                address: '0xERC20',
              } as TokenInfo,
            },
          },
        ] as BalanceRequirement[],
      };

      const amount = getAmountFromBalanceRequirement(balanceRequirements, '0xIMX');
      expect(amount).toEqual(BigInt(0));
    });
  });

  describe('getAmountToBridge', () => {
    it('should return 0 if balance is sufficient on L2', () => {
      const quotedAmountWithFees = BigInt(10);
      const amountFromBalanceRequirement = BigInt(10);
      const l2balance = {
        balance: BigInt(20),
      } as GetBalanceResult;
      const amountToBridge = getAmountToBridge(
        quotedAmountWithFees,
        amountFromBalanceRequirement,
        l2balance,
      );
      expect(amountToBridge).toEqual(BigInt(0));
    });

    it('should return 0 if balance is sufficient on L2 and there is no balance requirement', () => {
      const quotedAmountWithFees = BigInt(10);
      const amountFromBalanceRequirement = BigInt(0);
      const l2balance = {
        balance: BigInt(10),
      } as GetBalanceResult;
      const amountToBridge = getAmountToBridge(
        quotedAmountWithFees,
        amountFromBalanceRequirement,
        l2balance,
      );
      expect(amountToBridge).toEqual(BigInt(0));
    });

    it('should return quoted amount and balance requirement in full if no L2 balance', () => {
      const quotedAmountWithFees = BigInt(10);
      const amountFromBalanceRequirement = BigInt(10);
      const l2balance = {
        balance: BigInt(0),
      } as GetBalanceResult;
      const amountToBridge = getAmountToBridge(
        quotedAmountWithFees,
        amountFromBalanceRequirement,
        l2balance,
      );
      expect(amountToBridge).toEqual(BigInt(20));
    });

    it('should return quoted amount and balance requirement in full if L2 balance undefined', () => {
      const quotedAmountWithFees = BigInt(10);
      const amountFromBalanceRequirement = BigInt(10);
      const l2balance = undefined;
      const amountToBridge = getAmountToBridge(
        quotedAmountWithFees,
        amountFromBalanceRequirement,
        l2balance,
      );
      expect(amountToBridge).toEqual(BigInt(20));
    });

    it('should return quoted amount minus remaining balance after balance requirement subtracted', () => {
      const quotedAmountWithFees = BigInt(10);
      const amountFromBalanceRequirement = BigInt(20);
      const l2balance = {
        balance: BigInt(25),
      } as GetBalanceResult;
      const amountToBridge = getAmountToBridge(
        quotedAmountWithFees,
        amountFromBalanceRequirement,
        l2balance,
      );
      expect(amountToBridge).toEqual(BigInt(5));
    });

    it('should return exactly quoted amount if remainder 0', () => {
      const quotedAmountWithFees = BigInt(10);
      const amountFromBalanceRequirement = BigInt(20);
      const l2balance = {
        balance: BigInt(20),
      } as GetBalanceResult;
      const amountToBridge = getAmountToBridge(
        quotedAmountWithFees,
        amountFromBalanceRequirement,
        l2balance,
      );
      expect(amountToBridge).toEqual(BigInt(10));
    });

    it('should return quoted amount and some of the remaining balance if negative remainder', () => {
      const quotedAmountWithFees = BigInt(10);
      const amountFromBalanceRequirement = BigInt(20);
      const l2balance = {
        balance: BigInt(15),
      } as GetBalanceResult;
      const amountToBridge = getAmountToBridge(
        quotedAmountWithFees,
        amountFromBalanceRequirement,
        l2balance,
      );
      expect(amountToBridge).toEqual(BigInt(15));
    });
  });
});
