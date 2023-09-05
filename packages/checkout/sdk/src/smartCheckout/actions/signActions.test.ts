/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
import { Web3Provider } from '@ethersproject/providers';
import { TypedDataDomain } from 'ethers';
import { signActions } from './signActions';
import { CheckoutErrorType } from '../../errors';
import { UnsignedActions } from '../../types';

describe('signActions', () => {
  let mockProvider: Web3Provider;

  it('should sign actions', async () => {
    mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        sendTransaction: jest.fn().mockResolvedValue({}),
        _signTypedData: jest.fn().mockResolvedValue({}),
      }),
    } as unknown as Web3Provider;

    const mockUnsignedActions: UnsignedActions = {
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
      signableMessages: [
        {
          domain: {
            domain: 'domain',
          } as TypedDataDomain,
          types: { typedDataField: [] },
          value: { value: 'value' },
        },
        {
          domain: {
            domain2: 'domain2',
          } as TypedDataDomain,
          types: { typedDataField2: [] },
          value: { value2: 'value' },
        },
      ],
    };

    await signActions(mockProvider, mockUnsignedActions);
    expect(mockProvider.getSigner().sendTransaction).toHaveBeenCalledTimes(4);
    expect(mockProvider.getSigner()._signTypedData).toHaveBeenCalledTimes(2);
    expect(mockProvider.getSigner().sendTransaction).toHaveBeenCalledWith({
      data: '0xAPPROVAL1',
      to: '0x123',
    });
    expect(mockProvider.getSigner().sendTransaction).toHaveBeenCalledWith({
      data: '0xAPPROVAL2',
      to: '0x123',
    });
    expect(mockProvider.getSigner()._signTypedData).toHaveBeenCalledWith(
      {
        domain: 'domain',
      } as TypedDataDomain,
      { typedDataField: [] },
      { value: 'value' },
    );
    expect(mockProvider.getSigner()._signTypedData).toHaveBeenCalledWith(
      {
        domain2: 'domain2',
      } as TypedDataDomain,
      { typedDataField2: [] },
      { value2: 'value' },
    );
    expect(mockProvider.getSigner().sendTransaction).toHaveBeenCalledWith({
      data: '0xFULFILMENT1',
      to: '0x123',
    });
    expect(mockProvider.getSigner().sendTransaction).toHaveBeenCalledWith({
      data: '0xFULFILMENT2',
      to: '0x123',
    });
  });

  it('should sign the approval transaction', async () => {
    mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        sendTransaction: jest.fn().mockResolvedValue({}),
        _signTypedData: jest.fn().mockResolvedValue({}),
      }),
    } as unknown as Web3Provider;

    const mockUnsignedActions: UnsignedActions = {
      approvalTransactions: [
        {
          to: '0x123',
          data: '0xAPPROVAL',
        },
      ],
      fulfilmentTransactions: [],
      signableMessages: [],
    };

    await signActions(mockProvider, mockUnsignedActions);
    expect(mockProvider.getSigner().sendTransaction).toHaveBeenCalledTimes(1);
    expect(mockProvider.getSigner()._signTypedData).toHaveBeenCalledTimes(0);
    expect(mockProvider.getSigner().sendTransaction).toHaveBeenCalledWith({
      data: '0xAPPROVAL',
      to: '0x123',
    });
  });

  it('should sign the fulfilment transaction', async () => {
    mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        sendTransaction: jest.fn().mockResolvedValue({}),
        _signTypedData: jest.fn().mockResolvedValue({}),
      }),
    } as unknown as Web3Provider;

    const mockUnsignedActions: UnsignedActions = {
      approvalTransactions: [],
      fulfilmentTransactions: [
        {
          to: '0x123',
          data: '0xFULFILMENT',
        },
      ],
      signableMessages: [],
    };

    await signActions(mockProvider, mockUnsignedActions);
    expect(mockProvider.getSigner().sendTransaction).toHaveBeenCalledTimes(1);
    expect(mockProvider.getSigner()._signTypedData).toHaveBeenCalledTimes(0);
    expect(mockProvider.getSigner().sendTransaction).toHaveBeenCalledWith({
      data: '0xFULFILMENT',
      to: '0x123',
    });
  });

  it('should sign the signable message', async () => {
    mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        sendTransaction: jest.fn().mockResolvedValue({}),
        _signTypedData: jest.fn().mockResolvedValue({}),
      }),
    } as unknown as Web3Provider;

    const mockUnsignedActions: UnsignedActions = {
      approvalTransactions: [],
      fulfilmentTransactions: [],
      signableMessages: [
        {
          domain: {
            domain: 'domain',
          } as TypedDataDomain,
          types: { typedDataField: [] },
          value: { value: 'value' },
        },
      ],
    };

    await signActions(mockProvider, mockUnsignedActions);
    expect(mockProvider.getSigner().sendTransaction).toHaveBeenCalledTimes(0);
    expect(mockProvider.getSigner()._signTypedData).toHaveBeenCalledTimes(1);
    expect(mockProvider.getSigner()._signTypedData).toHaveBeenCalledWith(
      {
        domain: 'domain',
      } as TypedDataDomain,
      { typedDataField: [] },
      { value: 'value' },
    );
  });

  it('should throw an error if approval transaction fails', async () => {
    mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        sendTransaction: jest.fn().mockRejectedValue(new Error('ERROR')),
      }),
    } as unknown as Web3Provider;

    const mockUnsignedActions: UnsignedActions = {
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
      signableMessages: [],
    };

    let message = '';
    let type = '';
    let data = '';

    try {
      await signActions(mockProvider, mockUnsignedActions);
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

    const mockUnsignedActions: UnsignedActions = {
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
      signableMessages: [],
    };

    let message = '';
    let type = '';
    let data = '';

    try {
      await signActions(mockProvider, mockUnsignedActions);
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

  it('should throw an error if sign message fails', async () => {
    mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        sendTransaction: jest.fn().mockResolvedValue({}),
        _signTypedData: jest.fn().mockRejectedValue(new Error('ERROR')),
      }),
    } as unknown as Web3Provider;

    const mockUnsignedActions: UnsignedActions = {
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
      signableMessages: [
        {
          domain: {
            domain: 'domain',
          } as TypedDataDomain,
          types: { typedDataField: [] },
          value: { value: 'value' },
        },
      ],
    };

    let message = '';
    let type = '';
    let data = '';

    try {
      await signActions(mockProvider, mockUnsignedActions);
    } catch (err: any) {
      message = err.message;
      type = err.type;
      data = err.data;
    }

    expect(message).toEqual('An error occurred while executing the signable transaction');
    expect(type).toEqual(CheckoutErrorType.EXECUTE_TRANSACTIONS_ERROR);
    expect(data).toEqual({
      message: 'ERROR',
    });
  });
});
