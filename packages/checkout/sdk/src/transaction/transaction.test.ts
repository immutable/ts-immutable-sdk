import { BrowserProvider, ErrorCode } from 'ethers';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { sendTransaction } from './transaction';
import { ChainId, NetworkInfo } from '../types';
import { IMMUTABLE_ZKVEM_GAS_OVERRIDES } from '../env';

describe('transaction', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should send the transaction and return success', async () => {
    const transactionResponse = {
      hash: '123',
      from: '0x234',
      confirmations: 5,
    };
    const mockSendTransaction = jest.fn().mockResolvedValue(transactionResponse);
    const mockProvider = {
      getNetwork: jest.fn().mockReturnValue({
        chainId: ChainId.IMTBL_ZKEVM_TESTNET,
      } as NetworkInfo),
      getSigner: jest.fn().mockReturnValue({
        sendTransaction: mockSendTransaction,
      }),
    } as unknown as BrowserProvider;

    const transaction = {
      nonce: 0,
      gasPrice: '1',
      gas: '1',
      to: '0x123',
      from: '0x234',
      value: '100',
      data: 'data',
      chainId: ChainId.ETHEREUM,
    };

    await expect(sendTransaction(mockProvider, transaction)).resolves.toEqual({
      transactionResponse,
    });
    expect(mockSendTransaction).toHaveBeenCalledWith(transaction);
  });

  it('should return errored status if transaction errors', async () => {
    const mockProvider = {
      getNetwork: jest.fn().mockReturnValue({
        chainId: ChainId.ETHEREUM,
      } as NetworkInfo),
      getSigner: jest.fn().mockReturnValue({
        sendTransaction: () => {
          throw new Error('Transaction errored');
        },
      }),
    } as unknown as BrowserProvider;

    const transaction = {
      nonce: 1,
      gasPrice: '1',
      gas: '1',
      to: '0x123',
      from: '0x234',
      value: '100',
      data: 'data',
      chainId: ChainId.ETHEREUM,
    };

    await expect(sendTransaction(mockProvider, transaction)).rejects.toThrow(
      new CheckoutError(
        'Transaction errored',
        CheckoutErrorType.TRANSACTION_FAILED,
      ),
    );
  });

  it('should return insufficient funds status if transaction errors with insufficient funds', async () => {
    const mockProvider = {
      getNetwork: jest.fn().mockReturnValue({
        chainId: ChainId.ETHEREUM,
      } as NetworkInfo),
      getSigner: jest.fn().mockReturnValue({
        sendTransaction: () => {
          const err: any = new Error('insufficient funds');
          err.code = 'INSUFFICIENT_FUNDS' satisfies ErrorCode;
          throw err;
        },
      }),
    } as unknown as BrowserProvider;

    const transaction = {
      nonce: 1,
      gasPrice: '1',
      gas: '1',
      to: '0x123',
      from: '0x234',
      value: '100',
      data: 'data',
      chainId: ChainId.ETHEREUM,
    };

    try {
      await sendTransaction(mockProvider, transaction);
    } catch (err: any) {
      expect(err.message).toEqual('insufficient funds');
      expect(err.type).toEqual(CheckoutErrorType.INSUFFICIENT_FUNDS);
    }
  });

  it('should return user rejected request status if transaction errors with action rejected', async () => {
    const mockProvider = {
      getNetwork: jest.fn().mockReturnValue({
        chainId: ChainId.ETHEREUM,
      } as NetworkInfo),
      getSigner: jest.fn().mockReturnValue({
        sendTransaction: () => {
          const err: any = new Error('user rejected request');
          err.code = 'ACTION_REJECTED' satisfies ErrorCode;
          throw err;
        },
      }),
    } as unknown as BrowserProvider;

    const transaction = {
      nonce: 1,
      gasPrice: '1',
      gas: '1',
      to: '0x123',
      from: '0x234',
      value: '100',
      data: 'data',
      chainId: ChainId.ETHEREUM,
    };

    try {
      await sendTransaction(mockProvider, transaction);
    } catch (err: any) {
      expect(err.message).toEqual('user rejected request');
      expect(err.type).toEqual(CheckoutErrorType.USER_REJECTED_REQUEST_ERROR);
    }
  });

  it(
    'should include txn gas limits for zkEVM chains if the gasPrice is not defined on the transaction',
    async () => {
      const transactionResponse = {
        hash: '123',
        from: '0x234',
        confirmations: 5,
      };
      const mockSendTransaction = jest.fn().mockResolvedValue(transactionResponse);
      const mockProvider = {
        getNetwork: jest.fn().mockReturnValue({
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
        } as NetworkInfo),
        getSigner: jest.fn().mockReturnValue({
          sendTransaction: mockSendTransaction,
        }),
      } as unknown as BrowserProvider;

      const transaction = {
        to: '0xAAA',
        from: '0x234',
        chainId: ChainId.ETHEREUM,
      };

      await expect(sendTransaction(mockProvider, transaction)).resolves.toEqual({
        transactionResponse,
      });
      expect(mockSendTransaction).toHaveBeenCalledWith({
        ...transaction,
        maxFeePerGas: IMMUTABLE_ZKVEM_GAS_OVERRIDES.maxFeePerGas,
        maxPriorityFeePerGas: IMMUTABLE_ZKVEM_GAS_OVERRIDES.maxPriorityFeePerGas,
      });
    },
  );
});
