import { Environment } from '@imtbl/config';
import { BigNumber } from 'ethers';
import {
  TokenInfo,
  TransactionDetails,
  TransactionResponse,
} from '@imtbl/dex-sdk';
import { TransactionRequest } from '@ethersproject/providers';
import { CheckoutConfiguration } from '../../../config';
import { ChainId } from '../../../types';
import { QuoteFetcherResponse, quoteFetcher } from './quoteFetcher';
import { createExchangeInstance } from '../../../instance';
import { CheckoutErrorType } from '../../../errors';

jest.mock('../../../instance');

describe('quoteFetcher', () => {
  const constructQuote = (
    quoteAmount: number,
    feeAmount: number,
    swapGasFeeEstimate?: number,
    approvalGasFeeEstimate?: number,
  ): TransactionResponse => {
    const resp: TransactionResponse = {
      swap: {
        transaction: {} as TransactionRequest,
        gasFeeEstimate: null,
      },
      quote: {
        amount: {
          value: BigNumber.from(quoteAmount),
          token: {} as TokenInfo,
        },
        amountWithMaxSlippage: {
          value: BigNumber.from(quoteAmount),
          token: {} as TokenInfo,
        },
        slippage: 0,
        fees: [
          {
            amount: {
              value: BigNumber.from(feeAmount),
              token: {} as TokenInfo,
            },
            recipient: '',
            basisPoints: 0,
          },
        ],
      },
      approval: null,
    };

    if (swapGasFeeEstimate) {
      resp.swap.gasFeeEstimate = {
        value: BigNumber.from(swapGasFeeEstimate),
        token: {} as TokenInfo,
      };
    }

    if (approvalGasFeeEstimate) {
      resp.approval = {
        gasFeeEstimate: {
          value: BigNumber.from(approvalGasFeeEstimate),
          token: {} as TokenInfo,
        },
      } as TransactionDetails;
    }

    return resp;
  };

  const constructDexResponse = (
    key: string,
    quoteAmount: number,
    feeAmount: number,
    swap?: number,
    approval?: number,
  ) => {
    const quoteFetcherResponse: QuoteFetcherResponse = {
      [key]: {
        approval: undefined,
        swap: null,
        quote: {
          amount: {
            value: BigNumber.from(quoteAmount),
            token: {} as TokenInfo,
          },
          amountWithMaxSlippage: {
            value: BigNumber.from(quoteAmount),
            token: {} as TokenInfo,
          },
          slippage: 0,
          fees: [
            {
              amount: {
                value: BigNumber.from(feeAmount),
                token: {} as TokenInfo,
              },
              recipient: '',
              basisPoints: 0,
            },
          ],
        },
      },
    };

    if (swap) {
      quoteFetcherResponse[key].swap = {
        value: BigNumber.from(swap),
        token: {} as TokenInfo,
      };
    }

    if (approval) {
      quoteFetcherResponse[key].approval = {
        value: BigNumber.from(approval),
        token: {} as TokenInfo,
      };
    }

    return quoteFetcherResponse;
  };

  const config = new CheckoutConfiguration({
    baseConfig: { environment: Environment.SANDBOX },
  });

  it('should fetch quotes', async () => {
    (createExchangeInstance as jest.Mock).mockReturnValue({
      getUnsignedSwapTxFromAmountIn: jest.fn()
        .mockResolvedValueOnce(
          constructQuote(1, 2, 3, 4),
        )
        .mockResolvedValueOnce(
          constructQuote(5, 6, 7, 8),
        )
        .mockResolvedValueOnce(
          constructQuote(9, 10, 11, 12),
        ),
    });

    const quotes = await quoteFetcher(
      config,
      ChainId.IMTBL_ZKEVM_TESTNET,
      '0xADDRESS',
      {
        address: '0xREQUIRED_ERC20',
        amount: BigNumber.from(0),
      },
      ['0xERC20_1', '0xERC20_2', '0xERC20_3'],
    );

    expect(quotes).toEqual({
      ...constructDexResponse('0xERC20_1', 1, 2, 3, 4),
      ...constructDexResponse('0xERC20_2', 5, 6, 7, 8),
      ...constructDexResponse('0xERC20_3', 9, 10, 11, 12),
    });
  });

  it('should fetch quotes with no approval', async () => {
    (createExchangeInstance as jest.Mock).mockReturnValue({
      getUnsignedSwapTxFromAmountIn: jest.fn()
        .mockResolvedValueOnce(
          constructQuote(1, 2, 3),
        )
        .mockResolvedValueOnce(
          constructQuote(5, 6, 7),
        )
        .mockResolvedValueOnce(
          constructQuote(9, 10, 11),
        ),
    });

    const quotes = await quoteFetcher(
      config,
      ChainId.IMTBL_ZKEVM_TESTNET,
      '0xADDRESS',
      {
        address: '0xREQUIRED_ERC20',
        amount: BigNumber.from(0),
      },
      ['0xERC20_1', '0xERC20_2', '0xERC20_3'],
    );

    expect(quotes).toEqual({
      ...constructDexResponse('0xERC20_1', 1, 2, 3),
      ...constructDexResponse('0xERC20_2', 5, 6, 7),
      ...constructDexResponse('0xERC20_3', 9, 10, 11),
    });
  });

  it('should fetch quotes with no swap', async () => {
    (createExchangeInstance as jest.Mock).mockReturnValue({
      getUnsignedSwapTxFromAmountIn: jest.fn()
        .mockResolvedValueOnce(
          constructQuote(1, 2),
        )
        .mockResolvedValueOnce(
          constructQuote(5, 6),
        )
        .mockResolvedValueOnce(
          constructQuote(9, 10),
        ),
    });

    const quotes = await quoteFetcher(
      config,
      ChainId.IMTBL_ZKEVM_TESTNET,
      '0xADDRESS',
      {
        address: '0xREQUIRED_ERC20',
        amount: BigNumber.from(0),
      },
      ['0xERC20_1', '0xERC20_2', '0xERC20_3'],
    );

    expect(quotes).toEqual({
      ...constructDexResponse('0xERC20_1', 1, 2),
      ...constructDexResponse('0xERC20_2', 5, 6),
      ...constructDexResponse('0xERC20_3', 9, 10),
    });
  });

  it('should throw error if dex quote errors', async () => {
    (createExchangeInstance as jest.Mock).mockRejectedValue(new Error('error from dex'));

    let type;
    let data;

    try {
      await quoteFetcher(
        config,
        ChainId.IMTBL_ZKEVM_TESTNET,
        '0xADDRESS',
        {
          address: '0xREQUIRED_ERC20',
          amount: BigNumber.from(0),
        },
        ['0xERC20_1', '0xERC20_2', '0xERC20_3'],
      );
    } catch (err: any) {
      type = err.type;
      data = err.data;
    }

    expect(type).toEqual(CheckoutErrorType.FETCH_SWAP_QUOTE_ERROR);
    expect(data).toEqual({
      message: 'error from dex',
    });
  });
});
