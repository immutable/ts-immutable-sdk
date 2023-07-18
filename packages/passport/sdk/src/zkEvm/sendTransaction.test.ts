import { JsonRpcProvider, TransactionRequest } from '@ethersproject/providers';
import { TransactionsApi } from '@imtbl/guardian';
import { getSignedMetaTransactions, getNonce } from './walletHelpers';
import { sendTransaction } from './sendTransaction';
import { mockUserZkEvm } from '../test/mocks';
import { RelayerClient } from './relayerClient';
import { PassportConfiguration } from '../config';
import { retryWithDelay } from '../network/retry';
import { RelayerTransaction, RelayerTransactionStatus } from './types';
import { JsonRpcError, RpcErrorCode } from './JsonRpcError';

jest.mock('@ethersproject/providers');
jest.mock('./walletHelpers', () => {
  const original = jest.requireActual('./walletHelpers');
  return {
    ...original,
    getSignedMetaTransactions: jest.fn(),
    getNonce: jest.fn(),
  };
});
jest.mock('../network/retry');

describe('sendTransaction', () => {
  const signedTransaction = 'signedTransaction123';
  const signedTransactions = 'signedTransactions123';
  const relayerTransactionId = 'relayerTransactionId123';
  const transactionHash = 'transactionHash123';

  const transactionRequest: TransactionRequest = {
    to: mockUserZkEvm.zkEvm.ethAddress,
    data: '0x456',
    value: '0x',
  };
  const magicProvider = {};
  const jsonRpcProvider = {};
  const relayerClient = {
    imGetFeeOptions: jest.fn(),
    ethSendTransaction: jest.fn(),
    imGetTransactionByHash: jest.fn(),
  };
  const transactionAPI = {
    evaluateTransaction: jest.fn(),
  };

  const nonce = 5;
  const config: Partial<PassportConfiguration> = {
    zkEvmChainId: 'eip155:13392',
  };

  const imxFeeOption = {
    tokenPrice: '0.0001',
    tokenSymbol: 'IMX',
    tokenDecimals: 18,
    tokenAddress: '0x1337',
    recipientAddress: '0x7331',
  };

  beforeEach(() => {
    jest.resetAllMocks();
    relayerClient.imGetFeeOptions.mockResolvedValue([imxFeeOption]);
    (getNonce as jest.Mock).mockResolvedValueOnce(nonce);
    (getSignedMetaTransactions as jest.Mock).mockResolvedValueOnce(signedTransaction);
    (getSignedMetaTransactions as jest.Mock).mockResolvedValueOnce(signedTransactions);
    relayerClient.ethSendTransaction.mockResolvedValue(relayerTransactionId);
  });

  it('calls relayerClient.ethSendTransaction with the correct arguments', async () => {
    (retryWithDelay as jest.Mock).mockResolvedValue({
      status: RelayerTransactionStatus.SUCCESSFUL,
      hash: transactionHash,
    } as RelayerTransaction);

    const result = await sendTransaction({
      params: [transactionRequest],
      magicProvider,
      jsonRpcProvider: jsonRpcProvider as JsonRpcProvider,
      transactionAPI: transactionAPI as unknown as TransactionsApi,
      relayerClient: relayerClient as unknown as RelayerClient,
      config: config as PassportConfiguration,
      user: mockUserZkEvm,
    });

    expect(result).toEqual(transactionHash);
    expect(relayerClient.ethSendTransaction).toHaveBeenCalledWith(mockUserZkEvm.zkEvm.ethAddress, signedTransactions);
  });

  it('calls guardian.evaluateTransaction with the correct arguments', async () => {
    (retryWithDelay as jest.Mock).mockResolvedValue({
      status: RelayerTransactionStatus.SUCCESSFUL,
      hash: transactionHash,
    } as RelayerTransaction);

    const result = await sendTransaction({
      params: [transactionRequest],
      magicProvider,
      jsonRpcProvider: jsonRpcProvider as JsonRpcProvider,
      transactionAPI: transactionAPI as unknown as TransactionsApi,
      relayerClient: relayerClient as unknown as RelayerClient,
      config: config as PassportConfiguration,
      user: mockUserZkEvm,
    });

    expect(result).toEqual(transactionHash);
    expect(transactionAPI.evaluateTransaction).toHaveBeenCalledWith({
      id: 'evm',
      transactionEvaluationRequest: {
        chainType: 'evm',
        chainId: config.zkEvmChainId,
        transactionData: {
          metaTransactions: [
            {
              data: transactionRequest.data,
              delegateCall: false,
              gasLimit: {
                _hex: '0x00',
                _isBigNumber: true,
              },
              revertOnError: true,
              target: mockUserZkEvm.zkEvm.ethAddress,
              value: '0x',
            },
            {
              data: [],
              delegateCall: false,
              gasLimit: {
                _hex: '0x00',
                _isBigNumber: true,
              },
              revertOnError: true,
              target: imxFeeOption.recipientAddress,
              value: imxFeeOption.tokenPrice,
            },
          ],
          nonce,
          userAddress: mockUserZkEvm.zkEvm.ethAddress,
        },
      },
    });
    expect(relayerClient.ethSendTransaction).toHaveBeenCalledWith(mockUserZkEvm.zkEvm.ethAddress, signedTransactions);
  });

  it('returns an error if the relayer does not return a successful status', async () => {
    (retryWithDelay as jest.Mock).mockResolvedValue({
      status: RelayerTransactionStatus.FAILED,
    } as RelayerTransaction);

    await expect(sendTransaction({
      params: [transactionRequest],
      magicProvider,
      jsonRpcProvider: jsonRpcProvider as JsonRpcProvider,
      transactionAPI: transactionAPI as unknown as TransactionsApi,
      relayerClient: relayerClient as unknown as RelayerClient,
      config: config as PassportConfiguration,
      user: mockUserZkEvm,
    })).rejects.toThrow(new JsonRpcError(RpcErrorCode.INTERNAL_ERROR, 'Transaction failed to submit with status FAILED'));
  });
});
