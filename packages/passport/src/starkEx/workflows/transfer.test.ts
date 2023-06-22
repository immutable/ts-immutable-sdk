import { TransfersApi, UnsignedTransferRequest } from '@imtbl/core-sdk';
import * as guardian from '@imtbl/guardian';
import { PassportError, PassportErrorType } from '../../errors/passportError';
import { mockErrorMessage, mockStarkSignature, mockUserWithEtherKey } from '../../test/mocks';
import { batchNftTransfer, transfer } from './transfer';
import { ConfirmationScreen, TransactionTypes } from '../../confirmation';

jest.mock('../../confirmation');
jest.mock('@imtbl/guardian');

describe('transfer', () => {
  afterEach(jest.resetAllMocks);
  let mockGetTransactionByID: jest.Mock;
  let mockEvaluateStarkexTransaction: jest.Mock;

  const mockConfirmationScreen = new ConfirmationScreen({} as any);

  const mockStarkSigner = {
    signMessage: jest.fn(),
    getAddress: jest.fn(),
  };

  beforeEach(() => {
    mockGetTransactionByID = jest.fn();
    mockEvaluateStarkexTransaction = jest.fn();
    (guardian.TransactionsApi as jest.Mock).mockImplementation(() => ({
      getTransactionByID: mockGetTransactionByID,
    }));
    (guardian.StarkexTransactionsApi as jest.Mock).mockImplementation(() => ({
      evaluateStarkexTransaction: mockEvaluateStarkexTransaction,
    }));
  });

  describe('single transfer', () => {
    let getSignableTransferV1Mock: jest.Mock;
    let createTransferV1Mock: jest.Mock;
    let transferApiMock: TransfersApi;

    const mockReceiver = 'AAA';
    const type = 'ERC721';
    const tokenId = '111';
    const tokenAddress = '0x1234';
    const mockTransferRequest = {
      type,
      tokenId,
      tokenAddress,
      receiver: mockReceiver,
    };
    const mockGuardianDomain = 'http://mockGuardianDomain.com';

    beforeEach(() => {
      getSignableTransferV1Mock = jest.fn();
      createTransferV1Mock = jest.fn();
      transferApiMock = {
        getSignableTransferV1: getSignableTransferV1Mock,
        createTransferV1: createTransferV1Mock,
      } as unknown as TransfersApi;
    });

    it('should returns success transfer result', async () => {
      const mockSignableTransferRequest = {
        getSignableTransferRequest: {
          amount: '1',
          receiver: mockReceiver,
          sender: mockUserWithEtherKey.etherKey,
          token: {
            data: { token_address: tokenAddress, token_id: tokenId },
            type,
          },
        },
      };
      const mockSignableTransferV1Response = {
        data: {
          payload_hash: '123123',
          sender_stark_key: 'starkKey',
          sender_vault_id: '111',
          receiver_stark_key: 'starkKey2',
          receiver_vault_id: '222',
          asset_id: tokenId,
          amount: '1',
          nonce: '5321',
          expiration_timestamp: '1234',
        },
      };
      const {
        payload_hash: mockPayloadHash,
        ...restSignableTransferV1Response
      } = mockSignableTransferV1Response.data;
      const mockCreateTransferRequest = {
        createTransferRequest: {
          ...restSignableTransferV1Response,
          stark_signature: mockStarkSignature,
        },
      };
      const mockHeader = {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Authorization: `Bearer ${mockUserWithEtherKey.accessToken}`,
        },
      };
      const mockReturnValue = {
        sent_signature: '0x1c8aff950685c2ed4bc3174f3472287b56d95',
        status: 'success',
        time: 111,
        transfer_id: 123,
      };
      mockGetTransactionByID.mockResolvedValue({
        data: {
          id: mockPayloadHash,
        },
      });
      mockEvaluateStarkexTransaction.mockResolvedValue({
        data: {
          confirmationRequired: true,
        },
      });

      (mockConfirmationScreen.startGuardianTransaction as jest.Mock).mockResolvedValue({

        confirmed: true,
      });
      getSignableTransferV1Mock.mockResolvedValue(
        mockSignableTransferV1Response,
      );
      mockStarkSigner.signMessage.mockResolvedValue(mockStarkSignature);
      createTransferV1Mock.mockResolvedValue({
        data: mockReturnValue,
      });

      const result = await transfer({
        transfersApi: transferApiMock,
        starkSigner: mockStarkSigner,
        user: mockUserWithEtherKey,
        request: mockTransferRequest as UnsignedTransferRequest,
        imxPublicApiDomain: mockGuardianDomain,
        confirmationScreen: mockConfirmationScreen,
      });

      expect(getSignableTransferV1Mock).toBeCalledWith(mockSignableTransferRequest, mockHeader);
      expect(mockStarkSigner.signMessage).toBeCalledWith(mockPayloadHash);
      expect(mockConfirmationScreen.loading).toBeCalledTimes(1);
      expect(mockConfirmationScreen.startGuardianTransaction).toHaveBeenCalledWith(
        mockSignableTransferV1Response.data.payload_hash,
      );
      expect(createTransferV1Mock).toBeCalledWith(
        mockCreateTransferRequest,
        mockHeader,
      );
      expect(result).toEqual(mockReturnValue);
    });

    it('should avoid confirmation popup if evaluateStarkexTransaction returns false', async () => {
      const mockSignableTransferRequest = {
        getSignableTransferRequest: {
          amount: '1',
          receiver: mockReceiver,
          sender: mockUserWithEtherKey.etherKey,
          token: {
            data: { token_address: tokenAddress, token_id: tokenId },
            type,
          },
        },
      };
      const mockSignableTransferV1Response = {
        data: {
          payload_hash: '123123',
          sender_stark_key: 'starkKey',
          sender_vault_id: '111',
          receiver_stark_key: 'starkKey2',
          receiver_vault_id: '222',
          asset_id: tokenId,
          amount: '1',
          nonce: '5321',
          expiration_timestamp: '1234',
        },
      };
      const {
        payload_hash: mockPayloadHash,
        ...restSignableTransferV1Response
      } = mockSignableTransferV1Response.data;
      const mockCreateTransferRequest = {
        createTransferRequest: {
          ...restSignableTransferV1Response,
          stark_signature: mockStarkSignature,
        },
      };
      const mockHeader = {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Authorization: `Bearer ${mockUserWithEtherKey.accessToken}`,
        },
      };
      const mockReturnValue = {
        sent_signature: '0x1c8aff950685c2ed4bc3174f3472287b56d95',
        status: 'success',
        time: 111,
        transfer_id: 123,
      };

      mockGetTransactionByID.mockResolvedValue({
        data: {
          id: mockPayloadHash,
        },
      });
      mockEvaluateStarkexTransaction.mockResolvedValue({
        data: {
          confirmationRequired: false,
        },
      });

      (mockConfirmationScreen.startGuardianTransaction as jest.Mock).mockResolvedValue({

        confirmed: true,
      });
      getSignableTransferV1Mock.mockResolvedValue(
        mockSignableTransferV1Response,
      );
      mockStarkSigner.signMessage.mockResolvedValue(mockStarkSignature);
      createTransferV1Mock.mockResolvedValue({
        data: mockReturnValue,
      });

      const result = await transfer({
        transfersApi: transferApiMock,
        starkSigner: mockStarkSigner,
        user: mockUserWithEtherKey,
        request: mockTransferRequest as UnsignedTransferRequest,
        imxPublicApiDomain: mockGuardianDomain,
        confirmationScreen: mockConfirmationScreen,
      });

      expect(getSignableTransferV1Mock).toBeCalledWith(mockSignableTransferRequest, mockHeader);
      expect(mockStarkSigner.signMessage).toBeCalledWith(mockPayloadHash);
      expect(mockConfirmationScreen.loading).toBeCalledTimes(1);
      expect(mockConfirmationScreen.startGuardianTransaction).not.toBeCalled();
      expect(createTransferV1Mock).toBeCalledWith(
        mockCreateTransferRequest,
        mockHeader,
      );
      expect(result).toEqual(mockReturnValue);
    });

    it('should return error if failed to call public api', async () => {
      getSignableTransferV1Mock.mockRejectedValue(new Error(mockErrorMessage));

      await expect(() => transfer({
        transfersApi: transferApiMock,
        starkSigner: mockStarkSigner,
        user: mockUserWithEtherKey,
        request: mockTransferRequest as UnsignedTransferRequest,
        imxPublicApiDomain: mockGuardianDomain,
        confirmationScreen: mockConfirmationScreen,
      })).rejects.toThrow(
        new PassportError(
          `${PassportErrorType.TRANSFER_ERROR}: ${mockErrorMessage}`,
          PassportErrorType.TRANSFER_ERROR,
        ),
      );
    });

    it('should return error if transfer is rejected by user', async () => {
      const mockSignableTransferV1Response = {
        data: {
          payload_hash: '123123',
          sender_stark_key: 'starkKey',
          sender_vault_id: '111',
          receiver_stark_key: 'starkKey2',
          receiver_vault_id: '222',
          asset_id: tokenId,
          amount: '1',
          nonce: '5321',
          expiration_timestamp: '1234',
        },
      };

      getSignableTransferV1Mock.mockResolvedValue(
        mockSignableTransferV1Response,
      );
      mockGetTransactionByID.mockResolvedValue({
        data: {
          id: mockSignableTransferV1Response.data.payload_hash,
        },
      });
      mockEvaluateStarkexTransaction.mockResolvedValue({
        data: {
          confirmationRequired: true,
        },
      });
      (mockConfirmationScreen.startGuardianTransaction as jest.Mock).mockRejectedValue({
        confirmed: false,
      });

      await expect(() => transfer({
        transfersApi: transferApiMock,
        starkSigner: mockStarkSigner,
        user: mockUserWithEtherKey,
        request: mockTransferRequest as UnsignedTransferRequest,
        imxPublicApiDomain: mockGuardianDomain,
        confirmationScreen: mockConfirmationScreen,
      })).rejects.toThrowError('TRANSFER_ERROR');

      expect(mockConfirmationScreen.startGuardianTransaction).toHaveBeenCalledWith(
        mockSignableTransferV1Response.data.payload_hash,
      );
    });
  });

  describe('batchNftTransfer', () => {
    let getSignableTransferMock: jest.Mock;
    let createTransferMock: jest.Mock;
    let transferApiMock: TransfersApi;

    const transferRequest = [
      {
        tokenId: '1',
        tokenAddress: 'token_address',
        receiver: 'receiver_eth_address',
      },
    ];
    const popupOptions = {
      height: 784,
      width: 480,
    };

    beforeEach(() => {
      getSignableTransferMock = jest.fn();
      createTransferMock = jest.fn();
      transferApiMock = {
        getSignableTransfer: getSignableTransferMock,
        createTransfer: createTransferMock,
      } as unknown as TransfersApi;
    });

    it('should make a successful batch transfer request', async () => {
      const mockTransferResponse = {
        data: {
          transfer_ids: ['transfer_id_1'],
        },
      };
      const sender_stark_key = 'sender_stark_key';
      const sender_vault_id = 'sender_vault_id';
      const receiver_stark_key = 'receiver_stark_key';
      const receiver_vault_id = 'receiver_vault_id';
      const asset_id = 'asset_id';
      const amount = 'amount';
      const nonce = 'nonce';
      const expiration_timestamp = 'expiration_timestamp';

      const mockSignableTransferResponse = {
        data: {
          sender_stark_key,
          signable_responses: [
            {
              sender_vault_id,
              receiver_stark_key,
              receiver_vault_id,
              asset_id,
              amount,
              nonce,
              expiration_timestamp,
            },
          ],
        },
      };
      getSignableTransferMock.mockResolvedValue(mockSignableTransferResponse);
      mockStarkSigner.signMessage.mockResolvedValue(mockStarkSignature);
      createTransferMock.mockResolvedValue(mockTransferResponse);
      (mockConfirmationScreen.startTransaction as jest.Mock).mockResolvedValue({
        confirmed: true,
      });

      const result = await batchNftTransfer({
        user: mockUserWithEtherKey,
        starkSigner: mockStarkSigner,
        request: transferRequest,
        transfersApi: transferApiMock,
        confirmationScreen: mockConfirmationScreen,
      });

      expect(result).toEqual({
        transfer_ids: mockTransferResponse.data.transfer_ids,
      });
      expect(getSignableTransferMock).toHaveBeenCalledWith({
        getSignableTransferRequestV2: {
          sender_ether_key: mockUserWithEtherKey.etherKey,
          signable_requests: [
            {
              amount: '1',
              token: {
                type: 'ERC721',
                data: {
                  token_id: transferRequest[0].tokenId,
                  token_address: transferRequest[0].tokenAddress,
                },
              },
              receiver: transferRequest[0].receiver,
            },
          ],
        },
      });
      expect(mockStarkSigner.signMessage).toHaveBeenCalled();
      expect(mockConfirmationScreen.startTransaction).toHaveBeenCalledWith(
        mockUserWithEtherKey.accessToken,
        {
          transactionType: TransactionTypes.createBatchTransfer,
          transactionData: expect.any(Object),
        },
        popupOptions,
      );
      expect(createTransferMock).toHaveBeenCalledWith(
        {
          createTransferRequestV2: {
            sender_stark_key,
            requests: [
              {
                sender_vault_id,
                receiver_stark_key,
                receiver_vault_id,
                asset_id,
                amount,
                nonce,
                expiration_timestamp,
                stark_signature: mockStarkSignature,
              },
            ],
          },
        },
        {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Authorization: `Bearer ${mockUserWithEtherKey.accessToken}`,
          },
        },
      );
    });

    it('should return error if failed to call public api', async () => {
      getSignableTransferMock.mockRejectedValue(new Error(mockErrorMessage));

      await expect(() => batchNftTransfer({
        user: mockUserWithEtherKey,
        starkSigner: mockStarkSigner,
        request: transferRequest,
        transfersApi: transferApiMock,
        confirmationScreen: mockConfirmationScreen,
      })).rejects.toThrow(
        new PassportError(
          `${PassportErrorType.TRANSFER_ERROR}: ${mockErrorMessage}`,
          PassportErrorType.TRANSFER_ERROR,
        ),
      );
    });

    it('should return error if transfer is rejected by user', async () => {
      const sender_stark_key = 'sender_stark_key';
      const sender_vault_id = 'sender_vault_id';
      const receiver_stark_key = 'receiver_stark_key';
      const receiver_vault_id = 'receiver_vault_id';
      const asset_id = 'asset_id';
      const amount = 'amount';
      const nonce = 'nonce';
      const expiration_timestamp = 'expiration_timestamp';

      const mockSignableTransferResponse = {
        data: {
          sender_stark_key,
          signable_responses: [
            {
              sender_vault_id,
              receiver_stark_key,
              receiver_vault_id,
              asset_id,
              amount,
              nonce,
              expiration_timestamp,
            },
          ],
        },
      };
      getSignableTransferMock.mockResolvedValue(mockSignableTransferResponse);
      (mockConfirmationScreen.startTransaction as jest.Mock).mockRejectedValue({
        confirmed: false,
      });

      await expect(() => batchNftTransfer({
        user: mockUserWithEtherKey,
        starkSigner: mockStarkSigner,
        request: transferRequest,
        transfersApi: transferApiMock,
        confirmationScreen: mockConfirmationScreen,
      })).rejects.toThrowError('TRANSFER_ERROR');

      expect(mockConfirmationScreen.startTransaction).toHaveBeenCalledWith(
        mockUserWithEtherKey.accessToken,
        {
          transactionType: TransactionTypes.createBatchTransfer,
          transactionData: expect.any(Object),
        },
        popupOptions,
      );
    });
  });
});
