import { Environment } from '@imtbl/config';
import {
  Token,
  TransactionDetails,
  TransactionResponse,
} from '@imtbl/dex-sdk';
import { CheckoutConfiguration } from '../../../config';
import { ChainId } from '../../../types';
import { quoteFetcher } from './quoteFetcher';
import { createExchangeInstance } from '../../../instance';
import { DexQuote, DexQuotes } from '../types';
import { HttpClient } from '../../../api/http';
import { TransactionRequest } from 'ethers';

jest.mock('../../../instance');

describe('quoteFetcher', () => {
  const constructTransactionResponse = (
    quoteAmount: number,
    feeAmount: number,
    swapGasFeeEstimate?: number,
    approvalGasFeeEstimate?: number,
  ): TransactionResponse => {
    const transactionResponse: TransactionResponse = {
      swap: {
        transaction: {} as TransactionRequest,
        gasFeeEstimate: null,
      },
      quote: {
        amount: {
          value: BigInt(quoteAmount),
          token: {} as Token,
        },
        amountWithMaxSlippage: {
          value: BigInt(quoteAmount),
          token: {} as Token,
        },
        slippage: 0,
        fees: [
          {
            amount: {
              value: BigInt(feeAmount),
              token: {} as Token,
            },
            recipient: '',
            basisPoints: 0,
          },
        ],
      },
      approval: null,
    };

    if (swapGasFeeEstimate) {
      transactionResponse.swap.gasFeeEstimate = {
        value: BigInt(swapGasFeeEstimate),
        token: {} as Token,
      };
    }

    if (approvalGasFeeEstimate) {
      transactionResponse.approval = {
        gasFeeEstimate: {
          value: BigInt(approvalGasFeeEstimate),
          token: {} as Token,
        },
      } as TransactionDetails;
    }

    return transactionResponse;
  };

  const constructDexQuote = (
    quoteAmount: number,
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
          token: {} as Token,
        },
        amountWithMaxSlippage: {
          value: BigInt(quoteAmount),
          token: {} as Token,
        },
        slippage: 0,
        fees: [
          {
            amount: {
              value: BigInt(feeAmount),
              token: {} as Token,
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
        token: {} as Token,
      };
    }

    if (approval) {
      dexQuote.approval = {
        value: BigInt(approval),
        token: {} as Token,
      };
    }

    return dexQuote;
  };

  const mockedHttpClient = new HttpClient() as jest.Mocked<HttpClient>;
  const config = new CheckoutConfiguration({
    baseConfig: { environment: Environment.SANDBOX },
  }, mockedHttpClient);

  beforeEach(() => {
    jest.spyOn(console, 'info').mockImplementation(() => {});
  });

  it('should fetch quotes', async () => {
    (createExchangeInstance as jest.Mock).mockReturnValue({
      getUnsignedSwapTxFromAmountOut: jest.fn()
        .mockResolvedValueOnce(
          constructTransactionResponse(1, 2, 3, 4),
        )
        .mockResolvedValueOnce(
          constructTransactionResponse(5, 6, 7, 8),
        )
        .mockResolvedValueOnce(
          constructTransactionResponse(9, 10, 11, 12),
        ),
    });

    const mockDexQuotes: DexQuotes = new Map<string, DexQuote>([]);
    mockDexQuotes.set('0xERC20_1', constructDexQuote(1, 2, 3, 4));
    mockDexQuotes.set('0xERC20_2', constructDexQuote(5, 6, 7, 8));
    mockDexQuotes.set('0xERC20_3', constructDexQuote(9, 10, 11, 12));

    const quotes = await quoteFetcher(
      config,
      ChainId.IMTBL_ZKEVM_TESTNET,
      '0xADDRESS',
      {
        address: '0xREQUIRED_ERC20',
        amount: BigInt(0),
      },
      ['0xERC20_1', '0xERC20_2', '0xERC20_3'],
    );

    expect(quotes).toEqual(mockDexQuotes);
  });

  it('should fetch quotes with no approval', async () => {
    (createExchangeInstance as jest.Mock).mockReturnValue({
      getUnsignedSwapTxFromAmountOut: jest.fn()
        .mockResolvedValueOnce(
          constructTransactionResponse(1, 2, 3),
        )
        .mockResolvedValueOnce(
          constructTransactionResponse(5, 6, 7),
        )
        .mockResolvedValueOnce(
          constructTransactionResponse(9, 10, 11),
        ),
    });

    const mockDexQuotes: DexQuotes = new Map<string, DexQuote>([]);
    mockDexQuotes.set('0xERC20_1', constructDexQuote(1, 2, 3));
    mockDexQuotes.set('0xERC20_2', constructDexQuote(5, 6, 7));
    mockDexQuotes.set('0xERC20_3', constructDexQuote(9, 10, 11));

    const quotes = await quoteFetcher(
      config,
      ChainId.IMTBL_ZKEVM_TESTNET,
      '0xADDRESS',
      {
        address: '0xREQUIRED_ERC20',
        amount: BigInt(0),
      },
      ['0xERC20_1', '0xERC20_2', '0xERC20_3'],
    );

    expect(quotes).toEqual(mockDexQuotes);
  });

  it('should fetch quotes with no swap', async () => {
    (createExchangeInstance as jest.Mock).mockReturnValue({
      getUnsignedSwapTxFromAmountOut: jest.fn()
        .mockResolvedValueOnce(
          constructTransactionResponse(1, 2),
        )
        .mockResolvedValueOnce(
          constructTransactionResponse(5, 6),
        )
        .mockResolvedValueOnce(
          constructTransactionResponse(9, 10),
        ),
    });

    const mockDexQuotes: DexQuotes = new Map<string, DexQuote>([]);
    mockDexQuotes.set('0xERC20_1', constructDexQuote(1, 2));
    mockDexQuotes.set('0xERC20_2', constructDexQuote(5, 6));
    mockDexQuotes.set('0xERC20_3', constructDexQuote(9, 10));

    const quotes = await quoteFetcher(
      config,
      ChainId.IMTBL_ZKEVM_TESTNET,
      '0xADDRESS',
      {
        address: '0xREQUIRED_ERC20',
        amount: BigInt(0),
      },
      ['0xERC20_1', '0xERC20_2', '0xERC20_3'],
    );

    expect(quotes).toEqual(mockDexQuotes);
  });

  it('should return empty map if creating instance errors', async () => {
    (createExchangeInstance as jest.Mock).mockRejectedValue({});

    const quotes = await quoteFetcher(
      config,
      ChainId.IMTBL_ZKEVM_TESTNET,
      '0xADDRESS',
      {
        address: '0xREQUIRED_ERC20',
        amount: BigInt(0),
      },
      ['0xERC20_1', '0xERC20_2', '0xERC20_3'],
    );

    expect(quotes).toEqual(new Map<string, DexQuote>([]));
  });

  it('should fetch quotes that resolved', async () => {
    (createExchangeInstance as jest.Mock).mockReturnValue({
      getUnsignedSwapTxFromAmountOut: jest.fn()
        .mockResolvedValueOnce(
          constructTransactionResponse(1, 2, 3, 4),
        )
        .mockRejectedValueOnce(
          constructTransactionResponse(5, 6, 7, 8),
        )
        .mockResolvedValueOnce(
          constructTransactionResponse(9, 10, 11, 12),
        ),
    });

    const mockDexQuotes: DexQuotes = new Map<string, DexQuote>([]);
    mockDexQuotes.set('0xERC20_1', constructDexQuote(1, 2, 3, 4));
    mockDexQuotes.set('0xERC20_3', constructDexQuote(9, 10, 11, 12));

    const quotes = await quoteFetcher(
      config,
      ChainId.IMTBL_ZKEVM_TESTNET,
      '0xADDRESS',
      {
        address: '0xREQUIRED_ERC20',
        amount: BigInt(0),
      },
      ['0xERC20_1', '0xERC20_2', '0xERC20_3'],
    );

    expect(quotes).toEqual(mockDexQuotes);
  });

  it('should not fetch quote if swappable token matches required token', async () => {
    const getUnsignedSwapTxFromAmountOut = jest.fn();
    (createExchangeInstance as jest.Mock).mockReturnValue({
      getUnsignedSwapTxFromAmountOut,
    });

    await quoteFetcher(
      config,
      ChainId.IMTBL_ZKEVM_TESTNET,
      '0xADDRESS',
      {
        address: '0xREQUIRED_ERC20',
        amount: BigInt(0),
      },
      ['0xREQUIRED_ERC20'],
    );

    expect(getUnsignedSwapTxFromAmountOut).not.toBeCalled();
  });

  it('should fetch quote for tokens that do not match required token', async () => {
    const getUnsignedSwapTxFromAmountOut = jest.fn()
      .mockResolvedValue(
        constructTransactionResponse(1, 2, 3, 4),
      );
    (createExchangeInstance as jest.Mock).mockReturnValue({
      getUnsignedSwapTxFromAmountOut,
    });

    const mockDexQuotes: DexQuotes = new Map<string, DexQuote>([]);
    mockDexQuotes.set('0xERC20_1', constructDexQuote(1, 2, 3, 4));

    const quotes = await quoteFetcher(
      config,
      ChainId.IMTBL_ZKEVM_TESTNET,
      '0xADDRESS',
      {
        address: '0xREQUIRED_ERC20',
        amount: BigInt(0),
      },
      ['0xREQUIRED_ERC20', '0xERC20_1'],
    );

    expect(quotes).toEqual(mockDexQuotes);
    expect(getUnsignedSwapTxFromAmountOut).toBeCalledTimes(1);
  });
});
