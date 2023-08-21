import { JsonRpcProvider, TransactionRequest } from '@ethersproject/providers';
import { getEip155ChainId, getNonce, getSignedMetaTransactions } from './walletHelpers';
import { sendTransaction } from './sendTransaction';
import { mockUserZkEvm } from '../test/mocks';
import { RelayerClient } from './relayerClient';
import { retryWithDelay } from '../network/retry';
import { RelayerTransaction, RelayerTransactionStatus } from './types';
import { JsonRpcError, RpcErrorCode } from './JsonRpcError';
import GuardianClient from '../guardian/guardian';

jest.mock('@ethersproject/providers');
jest.mock('./walletHelpers');
jest.mock('../network/retry');
const withConfirmationScreenStub = jest.fn();

describe('sendTransaction', () => {
  const signedTransaction = 'signedTransaction123';
  const signedTransactions = 'signedTransactions123';
  const relayerTransactionId = 'relayerTransactionId123';
  const transactionHash = 'transactionHash123';

  const nonce = '5';
  const chainId = 13472;
  const eip155ChainId = `eip155:${chainId}`;

  const transactionRequest: TransactionRequest = {
    to: mockUserZkEvm.zkEvm.ethAddress,
    data: '0x456',
    value: '0x00',
  };
  const magicProvider = {};
  const jsonRpcProvider = {
    ready: Promise.resolve({ chainId }),
  };
  const relayerClient = {
    imGetFeeOptions: jest.fn(),
    ethSendTransaction: jest.fn(),
    imGetTransactionByHash: jest.fn(),
  };
  const guardianClient = {
    validateEVMTransaction: jest.fn(),
    withConfirmationScreen: jest.fn(() => (task: () => void) => task()),
    loading: jest.fn(),
  };

  const imxFeeOption = {
    tokenPrice: '1',
    tokenSymbol: 'IMX',
    tokenDecimals: 18,
    tokenAddress: '0x1337',
    recipientAddress: '0x7331',
  };

  beforeEach(() => {
    jest.resetAllMocks();
    relayerClient.imGetFeeOptions.mockResolvedValue([imxFeeOption]);
    (getNonce as jest.Mock).mockResolvedValueOnce(nonce);
    (getEip155ChainId as jest.Mock).mockReturnValue(eip155ChainId);
    (getSignedMetaTransactions as jest.Mock).mockResolvedValueOnce(
      signedTransaction,
    );
    (getSignedMetaTransactions as jest.Mock).mockResolvedValueOnce(
      signedTransactions,
    );
    relayerClient.ethSendTransaction.mockResolvedValue(relayerTransactionId);
    withConfirmationScreenStub.mockImplementation(() => (task: () => void) => task());
    guardianClient.withConfirmationScreen = withConfirmationScreenStub;
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
      relayerClient: relayerClient as unknown as RelayerClient,
      user: mockUserZkEvm,
      guardianClient: guardianClient as unknown as GuardianClient,
    });

    expect(result).toEqual(transactionHash);
    expect(relayerClient.ethSendTransaction).toHaveBeenCalledWith(
      mockUserZkEvm.zkEvm.ethAddress,
      signedTransactions,
    );
  });

  it('calls guardian.evaluateTransaction with the correct arguments', async () => {
    (retryWithDelay as jest.Mock).mockResolvedValue({
      status: RelayerTransactionStatus.SUCCESSFUL,
      hash: transactionHash,
    } as RelayerTransaction);
    (getEip155ChainId as jest.Mock).mockReturnValue(`eip155:${chainId}`);

    const result = await sendTransaction({
      params: [transactionRequest],
      magicProvider,
      jsonRpcProvider: jsonRpcProvider as JsonRpcProvider,
      relayerClient: relayerClient as unknown as RelayerClient,
      user: mockUserZkEvm,
      guardianClient: guardianClient as unknown as GuardianClient,
    });

    expect(result).toEqual(transactionHash);
    expect(getEip155ChainId).toHaveBeenCalledWith(chainId);
    expect(guardianClient.validateEVMTransaction).toHaveBeenCalledWith(
      {
        chainId: eip155ChainId,
        nonce,
        user: mockUserZkEvm,
        metaTransactions: [
          {
            data: transactionRequest.data,
            revertOnError: true,
            to: mockUserZkEvm.zkEvm.ethAddress,
            value: '0x00',
            nonce,
          },
          {
            revertOnError: true,
            to: imxFeeOption.recipientAddress,
            value: imxFeeOption.tokenPrice,
            nonce,
          },
        ],
      },
    );
    expect(relayerClient.ethSendTransaction).toHaveBeenCalledWith(
      mockUserZkEvm.zkEvm.ethAddress,
      signedTransactions,
    );
  });

  it('returns an error if the relayer does not return a successful status', async () => {
    (retryWithDelay as jest.Mock).mockResolvedValue({
      status: RelayerTransactionStatus.FAILED,
    } as RelayerTransaction);

    await expect(
      sendTransaction({
        params: [transactionRequest],
        magicProvider,
        jsonRpcProvider: jsonRpcProvider as JsonRpcProvider,
        relayerClient: relayerClient as unknown as RelayerClient,
        user: mockUserZkEvm,
        guardianClient: guardianClient as unknown as GuardianClient,
      }),
    ).rejects.toThrow(
      new JsonRpcError(
        RpcErrorCode.INTERNAL_ERROR,
        'Transaction failed to submit with status FAILED',
      ),
    );
  });
});
