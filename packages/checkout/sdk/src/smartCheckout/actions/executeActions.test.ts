import { Web3Provider } from '@ethersproject/providers';
import { executeTransactions } from './executeActions';
import { CheckoutErrorType } from '../../errors';

describe('executeTransactions', () => {
  let mockProvider: Web3Provider;

  it('should execute transactions', async () => {
    mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        sendTransaction: jest.fn().mockResolvedValue({}),
      }),
    } as unknown as Web3Provider;

    const mockUnsignedTransactions = {
      approvalTransactions: [
        {
          to: '0x123',
          data: '0xAPPROVAL1',
        },
        {
          to: '0x123',
          data: '0xAPPROVAL2',
        },
      ],
      fulfilmentTransactions: [
        {
          to: '0x123',
          data: '0xFULFILMENT1',
        },
        {
          to: '0x123',
          data: '0xFULFILMENT2',
        },
      ],
    };

    await executeTransactions(mockProvider, mockUnsignedTransactions);
    expect(mockProvider.getSigner().sendTransaction).toHaveBeenCalledTimes(4);
    expect(mockProvider.getSigner().sendTransaction).toHaveBeenCalledWith({
      data: '0xAPPROVAL1',
      to: '0x123',
    });
    expect(mockProvider.getSigner().sendTransaction).toHaveBeenCalledWith({
      data: '0xAPPROVAL2',
      to: '0x123',
    });
    expect(mockProvider.getSigner().sendTransaction).toHaveBeenCalledWith({
      data: '0xFULFILMENT1',
      to: '0x123',
    });
    expect(mockProvider.getSigner().sendTransaction).toHaveBeenCalledWith({
      data: '0xFULFILMENT2',
      to: '0x123',
    });
  });

  it('should execute the approval transaction', async () => {
    mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        sendTransaction: jest.fn().mockResolvedValue({}),
      }),
    } as unknown as Web3Provider;

    const mockUnsignedTransactions = {
      approvalTransactions: [
        {
          to: '0x123',
          data: '0xAPPROVAL',
        },
      ],
      fulfilmentTransactions: [],
    };

    await executeTransactions(mockProvider, mockUnsignedTransactions);
    expect(mockProvider.getSigner().sendTransaction).toHaveBeenCalledTimes(1);
    expect(mockProvider.getSigner().sendTransaction).toHaveBeenCalledWith({
      data: '0xAPPROVAL',
      to: '0x123',
    });
  });

  it('should execute the fulfilment transaction', async () => {
    mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        sendTransaction: jest.fn().mockResolvedValue({}),
      }),
    } as unknown as Web3Provider;

    const mockUnsignedTransactions = {
      approvalTransactions: [],
      fulfilmentTransactions: [
        {
          to: '0x123',
          data: '0xFULFILMENT',
        },
      ],
    };

    await executeTransactions(mockProvider, mockUnsignedTransactions);
    expect(mockProvider.getSigner().sendTransaction).toHaveBeenCalledTimes(1);
    expect(mockProvider.getSigner().sendTransaction).toHaveBeenCalledWith({
      data: '0xFULFILMENT',
      to: '0x123',
    });
  });

  it('should throw an error if approval transaction fails', async () => {
    mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        sendTransaction: jest.fn().mockRejectedValue(new Error('ERROR')),
      }),
    } as unknown as Web3Provider;

    const mockUnsignedTransactions = {
      approvalTransactions: [
        {
          to: '0x123',
          data: '0xAPPROVAL',
        },
      ],
      fulfilmentTransactions: [
        {
          to: '0x123',
          data: '0xFULFILMENT',
        },
      ],
    };

    let message = '';
    let type = '';
    let data = '';

    try {
      await executeTransactions(mockProvider, mockUnsignedTransactions);
    } catch (err: any) {
      message = err.message;
      type = err.type;
      data = err.data;
    }

    expect(message).toEqual('An error occurred while executing the approval transaction');
    expect(type).toEqual(CheckoutErrorType.EXECUTE_TRANSACTIONS_ERROR);
    expect(data).toEqual({
      message: 'ERROR',
    });
  });

  it('should throw an error if fulfilment transaction fails', async () => {
    mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        sendTransaction: jest.fn().mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('ERROR')),
      }),
    } as unknown as Web3Provider;

    const mockUnsignedTransactions = {
      approvalTransactions: [
        {
          to: '0x123',
          data: '0xAPPROVAL',
        },
      ],
      fulfilmentTransactions: [
        {
          to: '0x123',
          data: '0xFULFILMENT',
        },
      ],
    };

    let message = '';
    let type = '';
    let data = '';

    try {
      await executeTransactions(mockProvider, mockUnsignedTransactions);
    } catch (err: any) {
      message = err.message;
      type = err.type;
      data = err.data;
    }

    expect(message).toEqual('An error occurred while executing the transaction');
    expect(type).toEqual(CheckoutErrorType.EXECUTE_TRANSACTIONS_ERROR);
    expect(data).toEqual({
      message: 'ERROR',
    });
  });
});
