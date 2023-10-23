import { ConfirmationScreen } from 'confirmation';
import * as guardian from '@imtbl/guardian';
import { TransactionRequest } from '@ethersproject/providers';
import { ImmutableConfiguration } from '@imtbl/config';
import { UserZkEvm } from 'types';
import GuardianClient from './guardian';
import { mockUser, mockUserImx, mockUserZkEvm } from '../test/mocks';
import { JsonRpcError, RpcErrorCode } from '../zkEvm/JsonRpcError';
import { PassportConfiguration } from '../config';

jest.mock('@imtbl/guardian');
jest.mock('../confirmation/confirmation');

let guardianClient: GuardianClient;

describe('Guardian', () => {
  afterEach(jest.resetAllMocks);
  let mockGetTransactionByID: jest.Mock;
  let mockEvaluateTransaction: jest.Mock;
  let mockEvaluateMessage : jest.Mock;

  const mockConfirmationScreen = new ConfirmationScreen({} as any);

  beforeEach(() => {
    mockGetTransactionByID = jest.fn();
    mockEvaluateTransaction = jest.fn();
    mockEvaluateMessage = jest.fn();
    (guardian.TransactionsApi as jest.Mock).mockImplementation(() => ({
      getTransactionByID: mockGetTransactionByID,
      evaluateTransaction: mockEvaluateTransaction,
    }));
    (guardian.MessagesApi as jest.Mock).mockImplementation(() => ({ evaluateMessage: mockEvaluateMessage }));

    guardianClient = new GuardianClient({
      confirmationScreen: mockConfirmationScreen,
      config: new PassportConfiguration({
        baseConfig: {} as ImmutableConfiguration,
        clientId: 'client123',
        logoutRedirectUri: 'http://localhost:3000/logout',
        redirectUri: 'http://localhost:3000/redirect',
      }),
    });
  });

  describe('evaluateImxTransaction', () => {
    it('should retry getting transaction details and throw an error when transaction does not exist', async () => {
      mockGetTransactionByID.mockResolvedValue({ data: { id: '1234' } });
      mockEvaluateTransaction.mockResolvedValue({ data: { confirmationRequired: false } });

      await guardianClient.evaluateImxTransaction({ payloadHash: 'hash', user: mockUserImx });

      expect(mockConfirmationScreen.requestConfirmation).toBeCalledTimes(0);
      expect(mockEvaluateTransaction).toBeCalledWith({
        id: 'hash',
        transactionEvaluationRequest: { chainType: 'starkex' },
      }, {
        headers: { Authorization: `Bearer ${mockUser.accessToken}` },
      });
    });

    it('should not show the confirmation screen if it is not required', async () => {
      mockGetTransactionByID.mockResolvedValue({ data: { id: '1234' } });
      mockEvaluateTransaction.mockResolvedValue({ data: { confirmationRequired: false } });

      await guardianClient.evaluateImxTransaction({ payloadHash: 'hash', user: mockUserImx });

      expect(mockConfirmationScreen.requestConfirmation).toBeCalledTimes(0);
    });

    it('should show the confirmation screen when some of the confirmations are required', async () => {
      mockGetTransactionByID.mockResolvedValueOnce({ data: { id: '1234' } });
      mockEvaluateTransaction
        .mockResolvedValueOnce({ data: { confirmationRequired: true } });
      (mockConfirmationScreen.requestConfirmation as jest.Mock).mockResolvedValueOnce({ confirmed: true });

      await guardianClient.evaluateImxTransaction({ payloadHash: 'hash', user: mockUserImx });

      expect(mockConfirmationScreen.requestConfirmation).toHaveBeenCalledWith('hash', mockUserImx.imx.ethAddress, 'starkex');
    });

    it('should throw error if user did not confirm the transaction', async () => {
      mockGetTransactionByID.mockResolvedValueOnce({ data: { id: '1234' } });
      mockEvaluateTransaction
        .mockResolvedValueOnce({ data: { confirmationRequired: true } });
      (mockConfirmationScreen.requestConfirmation as jest.Mock).mockResolvedValueOnce({ confirmed: false });

      await expect(guardianClient.evaluateImxTransaction({ payloadHash: 'hash', user: mockUserImx })).rejects.toThrow('Transaction rejected by user');
    });

    describe('crossSdkBridgeEnabled', () => {
      it('throws an error if confirmation is required and the cross sdk bridge flag is enabled', async () => {
        mockGetTransactionByID.mockResolvedValueOnce({ data: { id: '1234' } });
        mockEvaluateTransaction
          .mockResolvedValueOnce({ data: { confirmationRequired: true } });

        guardianClient = new GuardianClient({
          confirmationScreen: mockConfirmationScreen,
          config: new PassportConfiguration({
            baseConfig: {} as ImmutableConfiguration,
            clientId: 'client123',
            logoutRedirectUri: 'http://localhost:3000/logout',
            redirectUri: 'http://localhost:3000/redirect',
            crossSdkBridgeEnabled: true,
          }),
        });

        await expect(guardianClient.evaluateImxTransaction({ payloadHash: 'hash', user: mockUserImx }))
          .rejects
          .toThrow('Transaction requires confirmation but this functionality is not supported in this environment. Please contact Immutable support if you need to enable this feature.');
      });
    });
  });

  describe('validateEVMTransaction', () => {
    it('throws an error if the request data fails to be parsed', async () => {
      const transactionRequest: TransactionRequest = {
        to: mockUserZkEvm.zkEvm.ethAddress,
        data: '0x456',
        value: '0x',
      };

      await expect(
        guardianClient.validateEVMTransaction({
          chainId: 'epi123',
          nonce: '5',
          user: mockUserZkEvm,
          metaTransactions: [
            {
              data: transactionRequest.data,
              revertOnError: true,
              to: mockUserZkEvm.zkEvm.ethAddress,
              value: '0x00',
              nonce: 5,
            },
            {
              revertOnError: true,
              to: '0x123',
              value: '0x',
              nonce: 5,
            },
          ],
        }),
      ).rejects.toThrow(
        new JsonRpcError(
          RpcErrorCode.PARSE_ERROR,
          'Transaction failed to parsing: invalid BigNumber string (argument="value", value="0x", code=INVALID_ARGUMENT, version=bignumber/5.7.0)',
        ),
      );
    });

    it('should not show the confirmation screen if it is not required', async () => {
      const transactionRequest: TransactionRequest = {
        to: mockUserZkEvm.zkEvm.ethAddress,
        data: '0x456',
        value: '0x',
      };

      mockEvaluateTransaction.mockResolvedValue({ data: { confirmationRequired: false } });

      await guardianClient.validateEVMTransaction({
        chainId: 'epi123',
        nonce: '5',
        user: mockUserZkEvm,
        metaTransactions: [
          {
            data: transactionRequest.data,
            revertOnError: true,
            to: mockUserZkEvm.zkEvm.ethAddress,
            value: '0x00',
            nonce: 5,
          },
        ],
      });

      expect(mockConfirmationScreen.requestConfirmation).toBeCalledTimes(0);

      expect(mockEvaluateTransaction).toBeCalledWith({
        id: 'evm',
        transactionEvaluationRequest: {
          chainId: 'epi123',
          chainType: 'evm',
          transactionData: {
            nonce: '5',
            userAddress: mockUserZkEvm.zkEvm.ethAddress,
            metaTransactions: [
              {
                data: transactionRequest.data,
                delegateCall: false,
                gasLimit: '0',
                revertOnError: true,
                target: mockUserZkEvm.zkEvm.ethAddress,
                value: '0',
              },
            ],
          },
        },
      }, {
        headers: { Authorization: `Bearer ${mockUser.accessToken}` },
      });
    });

    describe('crossSdkBridgeEnabled', () => {
      it('throws an error if confirmation is required and the cross sdk bridge flag is enabled', async () => {
        mockEvaluateTransaction.mockResolvedValue({ data: { confirmationRequired: true } });

        guardianClient = new GuardianClient({
          confirmationScreen: mockConfirmationScreen,
          config: new PassportConfiguration({
            baseConfig: {} as ImmutableConfiguration,
            clientId: 'client123',
            logoutRedirectUri: 'http://localhost:3000/logout',
            redirectUri: 'http://localhost:3000/redirect',
            crossSdkBridgeEnabled: true,
          }),
        });

        const transactionRequest: TransactionRequest = {
          to: mockUserZkEvm.zkEvm.ethAddress,
          data: '0x456',
          value: '0x',
        };

        await expect(
          guardianClient.validateEVMTransaction({
            chainId: 'epi123',
            nonce: '5',
            user: mockUserZkEvm,
            metaTransactions: [
              {
                data: transactionRequest.data,
                revertOnError: true,
                to: mockUserZkEvm.zkEvm.ethAddress,
                value: '0x00',
                nonce: 5,
              },
              {
                revertOnError: true,
                to: '0x123',
                value: '0x00',
                nonce: 5,
              },
            ],
          }),
        ).rejects.toThrow(
          new JsonRpcError(
            RpcErrorCode.TRANSACTION_REJECTED,
            'Transaction requires confirmation but this functionality is not supported in this environment. Please contact Immutable support if you need to enable this feature.',
          ),
        );
      });
    });
  });

  describe('withConfirmationScreenTask', () => {
    it('should call the task and close the confirmation screen if the task fails', async () => {
      const mockTask = jest.fn().mockRejectedValueOnce(new Error('Task failed'));
      await expect(guardianClient.withConfirmationScreenTask()(mockTask)()).rejects.toThrow('Task failed');
      expect(mockConfirmationScreen.closeWindow).toBeCalledTimes(1);
    });

    it('should call the task and return the result if the task succeeds', async () => {
      const mockTask = jest.fn().mockResolvedValueOnce('result');
      const wrappedTask = guardianClient.withConfirmationScreenTask()(mockTask);

      await expect(wrappedTask()).resolves.toEqual('result');

      expect(mockConfirmationScreen.closeWindow).toBeCalledTimes(0);
    });

    describe('withConfirmationScreen', () => {
      it('should call the task and close the confirmation screen if the task fails', async () => {
        const mockTask = jest.fn().mockRejectedValueOnce(new Error('Task failed'));

        await expect(guardianClient.withConfirmationScreen()(mockTask)).rejects.toThrow('Task failed');
        expect(mockConfirmationScreen.closeWindow).toBeCalledTimes(1);
      });

      it('should call the task and return the result if the task succeeds', async () => {
        const mockTask = jest.fn().mockResolvedValueOnce('result');
        const promise = guardianClient.withConfirmationScreen()(mockTask);

        await expect(promise).resolves.toEqual('result');
        expect(mockConfirmationScreen.closeWindow).toBeCalledTimes(0);
      });
    });

    describe('withDefaultConfirmationScreenTask', () => {
      it('should call the task and close the confirmation screen if the task fails', async () => {
        const mockTask = jest.fn().mockRejectedValueOnce(new Error('Task failed'));

        await expect(guardianClient.withDefaultConfirmationScreenTask(mockTask)()).rejects.toThrow('Task failed');
        expect(mockConfirmationScreen.closeWindow).toBeCalledTimes(1);
      });

      it('should call the task and return the result if the task succeeds', async () => {
        const mockTask = jest.fn().mockResolvedValueOnce('result');
        const wrappedTask = guardianClient.withDefaultConfirmationScreenTask(mockTask);

        await expect(wrappedTask()).resolves.toEqual('result');
        expect(mockConfirmationScreen.closeWindow).toBeCalledTimes(0);
      });
    });
  });

  describe('validateMessage', () => {
    const mockPayload = { chainID: '0x1234', payload: {} as guardian.EIP712Message, user: { accessToken: ':(' } as UserZkEvm };
    it('surfaces error message if message evaluation fails', async () => {
      mockEvaluateMessage.mockRejectedValueOnce(new Error('401: Unauthorized'));
      await expect(guardianClient.validateMessage(mockPayload))
        .rejects.toThrow('Message failed to validate with error: 401: Unauthorized');
    });
    it('displays confirmation screen if confirmation is required', async () => {
      mockEvaluateMessage.mockResolvedValueOnce({ data: { confirmationRequired: true, messageId: 'asd123' } });
      (mockConfirmationScreen.requestMessageConfirmation as jest.Mock).mockResolvedValueOnce({ confirmed: true });
      await guardianClient.validateMessage(mockPayload);
      expect(mockConfirmationScreen.requestMessageConfirmation).toBeCalledTimes(1);
    });
    it('displays rejection error message if user rejects confirmation', async () => {
      mockEvaluateMessage.mockResolvedValueOnce({ data: { confirmationRequired: true, messageId: 'asd123' } });
      (mockConfirmationScreen.requestMessageConfirmation as jest.Mock).mockResolvedValueOnce({ confirmed: false });
      await expect(guardianClient.validateMessage(mockPayload)).rejects.toEqual(new JsonRpcError(RpcErrorCode.TRANSACTION_REJECTED, 'Signature rejected by user'));
    });
  });
});
