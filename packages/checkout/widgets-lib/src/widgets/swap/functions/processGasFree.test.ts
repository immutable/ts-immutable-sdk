import { BrowserProvider } from 'ethers';
import {
  Amount,
  Fee,
  Quote,
  TransactionResponse,
} from '@imtbl/dex-sdk';
import { isGasFree } from '../../../lib/provider';
import { processGasFree } from './processGasFree';

jest.mock('../../../lib/provider');

describe('processGasFree', () => {
  let mockPassportProvider: BrowserProvider;
  let mockMetaMaskProvider: BrowserProvider;
  const mockQuote = {
    quote: {
      amount: {} as Amount,
      amountWithMaxSlippage: {} as Amount,
      slippage: 0,
      fees: [{
        recipient: '0x123',
        basisPoints: 100,
        amount: {
          value: BigInt(100),
          token: {
            symbol: 'ETH',
            address: '0x123',
            chainId: 1,
            decimals: 18,
          },
        },
      } as Fee],
    } as Quote,
    swap: {
      gasFeeEstimate: {
        value: BigInt(100),
      },
    },
    approval: {
      gasFeeEstimate: {
        value: BigInt(50),
      },
    },
  } as TransactionResponse;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPassportProvider = {
      provider: {
        isPassport: true,
      },
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0xADDRESS'),
      }),
    } as unknown as BrowserProvider;

    mockMetaMaskProvider = {
      provider: {
        isMetaMask: true,
      },
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0xADDRESS'),
      }),
    } as unknown as BrowserProvider;
  });

  it('should return the unmodified quote if the provider is not a passport provider', () => {
    (isGasFree as jest.Mock).mockReturnValue(false);
    const result = processGasFree(mockMetaMaskProvider, mockQuote);
    expect(result).toEqual(mockQuote);
  });

  it('should set gas fees to zero if the provider is a passport provider', () => {
    (isGasFree as jest.Mock).mockReturnValue(true);
    const result = processGasFree(mockPassportProvider, mockQuote);
    expect(result.swap.gasFeeEstimate!.value).toEqual(BigInt(0));
    expect(result.approval!.gasFeeEstimate!.value).toEqual(BigInt(0));
  });

  it('should handle quotes without swap or approval gas fees gracefully', () => {
    (isGasFree as jest.Mock).mockReturnValue(true);
    const incompleteQuote = { ...mockQuote, swap: undefined, approval: undefined } as unknown as TransactionResponse;

    const result = processGasFree(mockPassportProvider, incompleteQuote);
    expect(result).toEqual(incompleteQuote);
  });
});
