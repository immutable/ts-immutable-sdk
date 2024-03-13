import { BaseProvider, TransactionRequest } from '@ethersproject/providers';
import { Signer } from '@ethersproject/abstract-signer';
import { getEip155ChainId, getNonce, getSignedMetaTransactions } from './walletHelpers';
import { sendTransaction } from './sendTransaction';
import { chainId, chainIdEip155, mockUserZkEvm } from '../test/mocks';
import { RelayerClient } from './relayerClient';
import { retryWithDelay } from '../network/retry';
import { RelayerTransaction, RelayerTransactionStatus } from './types';
import { JsonRpcError, RpcErrorCode } from './JsonRpcError';
import GuardianClient from '../guardian';

jest.mock('./walletHelpers');
jest.mock('../network/retry');
const withConfirmationScreenStub = jest.fn();

describe('sendTransaction', () => {
  const signedTransaction = 'signedTransaction123';
  const signedTransactions = 'signedTransactions123';
  const relayerTransactionId = 'relayerTransactionId123';
  const transactionHash = 'transactionHash123';

  const nonce = '5';

  const transactionRequest: TransactionRequest = {
    to: mockUserZkEvm.zkEvm.ethAddress,
    data: '0x456',
    value: '0x00',
  };
  const rpcProvider = {
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
  const ethSigner = {
    getAddress: jest.fn(),
  } as Partial<Signer> as Signer;

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
    (getEip155ChainId as jest.Mock).mockReturnValue(chainIdEip155);
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
      ethSigner,
      rpcProvider: rpcProvider as BaseProvider,
      relayerClient: relayerClient as unknown as RelayerClient,
      zkevmAddress: mockUserZkEvm.zkEvm.ethAddress,
      guardianClient: guardianClient as unknown as GuardianClient,
    });

    expect(result).toEqual(transactionHash);
    expect(relayerClient.ethSendTransaction).toHaveBeenCalledWith(
      mockUserZkEvm.zkEvm.ethAddress,
      signedTransactions,
    );
  });

  it('calls relayerClient.ethSendTransaction with sponsored meta transaction', async () => {
    (retryWithDelay as jest.Mock).mockResolvedValue({
      status: RelayerTransactionStatus.SUCCESSFUL,
      hash: transactionHash,
    } as RelayerTransaction);

    const mockImxFeeOption = {
      tokenPrice: '0',
      tokenSymbol: 'IMX',
      tokenDecimals: 18,
      tokenAddress: '0x1337',
      recipientAddress: '0x7331',
    };

    relayerClient.imGetFeeOptions.mockResolvedValue([mockImxFeeOption]);

    const result = await sendTransaction({
      params: [transactionRequest],
      ethSigner,
      rpcProvider: rpcProvider as BaseProvider,
      relayerClient: relayerClient as unknown as RelayerClient,
      zkevmAddress: mockUserZkEvm.zkEvm.ethAddress,
      guardianClient: guardianClient as unknown as GuardianClient,
    });

    expect(result).toEqual(transactionHash);
    expect(guardianClient.validateEVMTransaction).toHaveBeenCalledWith(
      {
        chainId: chainIdEip155,
        nonce,
        metaTransactions: [
          {
            data: transactionRequest.data,
            revertOnError: true,
            to: mockUserZkEvm.zkEvm.ethAddress,
            value: '0x00',
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

  it('calls guardian.evaluateTransaction with the correct arguments', async () => {
    (retryWithDelay as jest.Mock).mockResolvedValue({
      status: RelayerTransactionStatus.SUCCESSFUL,
      hash: transactionHash,
    } as RelayerTransaction);
    (getEip155ChainId as jest.Mock).mockReturnValue(`eip155:${chainId}`);

    const result = await sendTransaction({
      params: [transactionRequest],
      ethSigner,
      rpcProvider: rpcProvider as BaseProvider,
      relayerClient: relayerClient as unknown as RelayerClient,
      zkevmAddress: mockUserZkEvm.zkEvm.ethAddress,
      guardianClient: guardianClient as unknown as GuardianClient,
    });

    expect(result).toEqual(transactionHash);
    expect(getEip155ChainId).toHaveBeenCalledWith(chainId);
    expect(guardianClient.validateEVMTransaction).toHaveBeenCalledWith(
      {
        chainId: chainIdEip155,
        nonce,
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

  it('returns and surfaces an error if the relayer does not return a successful status', async () => {
    (retryWithDelay as jest.Mock).mockResolvedValue({
      status: RelayerTransactionStatus.FAILED,
      statusMessage: 'Unable to complete transaction',
    } as RelayerTransaction);

    await expect(
      sendTransaction({
        params: [transactionRequest],
        ethSigner,
        rpcProvider: rpcProvider as BaseProvider,
        relayerClient: relayerClient as unknown as RelayerClient,
        zkevmAddress: mockUserZkEvm.zkEvm.ethAddress,
        guardianClient: guardianClient as unknown as GuardianClient,
      }),
    ).rejects.toThrow(
      new JsonRpcError(
        RpcErrorCode.INTERNAL_ERROR,
        'Transaction failed to submit with status FAILED. Error message: Unable to complete transaction',
      ),
    );
  });
});
