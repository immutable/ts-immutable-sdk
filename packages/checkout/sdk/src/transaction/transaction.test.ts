import { Web3Provider } from '@ethersproject/providers';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { sendTransaction } from './transaction';
import { ChainId } from '../types';

describe.skip('transaction', () => {
  it('should send the transaction and return success', async () => {
    const transactionResponse = {
      hash: '123',
      from: '0x234',
      confirmations: 5,
    };
    const mockProvider = {
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
});
