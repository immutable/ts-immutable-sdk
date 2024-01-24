import { Web3Provider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { sendTransaction } from './transaction';
import { ChainId, NetworkInfo } from '../types';

describe('transaction', () => {
  it('should send the transaction and return success', async () => {
    const transactionResponse = {
      hash: '123',
      from: '0x234',
      confirmations: 5,
    };
    const mockProvider = {
      getNetwork: jest.fn().mockReturnValue({
        chainId: ChainId.IMTBL_ZKEVM_TESTNET,
      } as NetworkInfo),
      getSigner: jest.fn().mockReturnValue({
        sendTransaction: () => transactionResponse,
      }),
    } as unknown as Web3Provider;

    const transaction = {
      nonce: 'nonce',
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
    } as unknown as Web3Provider;

    const transaction = {
      nonce: 'nonce',
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
          err.code = ethers.errors.INSUFFICIENT_FUNDS;
          throw err;
        },
      }),
    } as unknown as Web3Provider;

    const transaction = {
      nonce: 'nonce',
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
          err.code = ethers.errors.ACTION_REJECTED;
          throw err;
        },
      }),
    } as unknown as Web3Provider;

    const transaction = {
      nonce: 'nonce',
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
    'should return unpredictable gas limit request status if transaction errors with unpredictable gas limit',
    async () => {
      const mockProvider = {
        getNetwork: jest.fn().mockReturnValue({
          chainId: ChainId.ETHEREUM,
        } as NetworkInfo),
        getSigner: jest.fn().mockReturnValue({
          sendTransaction: () => {
            const err: any = new Error('unpredictable gas limit');
            err.code = ethers.errors.UNPREDICTABLE_GAS_LIMIT;
            throw err;
          },
        }),
      } as unknown as Web3Provider;

      const transaction = {
        to: '0x123',
        from: '0x234',
        chainId: ChainId.ETHEREUM,
      };

      try {
        await sendTransaction(mockProvider, transaction);
      } catch (err: any) {
        expect(err.message).toEqual('unpredictable gas limit');
        expect(err.type).toEqual(CheckoutErrorType.UNPREDICTABLE_GAS_LIMIT);
      }
    },
  );
});
