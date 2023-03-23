import { CreateTransferResponseV1, ETHAmount } from '@imtbl/core-sdk';
import { exchangeTransfer } from './exchange';
import { ExchangesApi } from '@imtbl/core-sdk';

describe('exchangeTransfer', () => {
  const getExchangeSignableTransferMock = jest.fn();
  const createExchangeTransferMock = jest.fn();
  const mockStarkAddres = '0x1111...';
  let exchangesApiMock: ExchangesApi;

  const mockUser = {
    etherKey: '0x123...',
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2V4YW1wbGUuYXV0aDAuY29tLyIsImF1ZCI6Imh0dHBzOi8vYXBpLmV4YW1wbGUuY29tL2NhbGFuZGFyL3YxLyIsInN1YiI6InVzcl8xMjMiLCJpYXQiOjE0NTg3ODU3OTYsImV4cCI6MTQ1ODg3MjE5Nn0.CA7eaHjIHz5NxeIJoFK9krqaeZrPLwmMmgI_XiQiIkQ',
    profile: {
      sub: '111',
    },
  };
  const mockStarkSigner = {
    getAddress: jest.fn(),
    signMessage: jest.fn(),
  };
  
  const ethAmount: ETHAmount = {
    type: 'ETH',
    amount: '100',
  };
  
  const exchangeTransferRequest = {
    ...ethAmount,
    receiver: '0x456...',
    transactionID: 'abc123',
  };

  beforeEach(() => {
    exchangesApiMock = {
      getExchangeSignableTransfer: getExchangeSignableTransferMock,
      createExchangeTransfer: createExchangeTransferMock,
    } as unknown as ExchangesApi;
  });

  it('should returns success exchange transfer result', async () => {
    const mockGetExchangeSignableTransferResponse = {
      data: {
        payload_hash: 'hash123',
        sender_stark_key: 'senderKey',
        sender_vault_id: 'senderVault',
        receiver_stark_key: 'receiverKey',
        receiver_vault_id: 'receiverVault',
        asset_id: 'assetID',
        amount: 100,
        nonce: 'nonce123',
        expiration_timestamp: 123456789,
      },
    };
    
    const mockCreateExchangeTransferResponse = {
      data: {
        sent_signature: 'signature123',
        status: 'SUCCESS',
        time: '2022-01-01T00:00:00Z',
        transfer_id: 'transfer123',
      },
    };

    mockStarkSigner.getAddress.mockResolvedValue(mockStarkAddres);
    getExchangeSignableTransferMock.mockResolvedValue(
      mockGetExchangeSignableTransferResponse
    );
    createExchangeTransferMock.mockResolvedValue(
      mockCreateExchangeTransferResponse
    );

    const response: CreateTransferResponseV1 = await exchangeTransfer({
      user: mockUser,
      starkSigner: mockStarkSigner,
      request: exchangeTransferRequest,
      exchangesApi: exchangesApiMock,
    });

    expect(getExchangeSignableTransferMock).toHaveBeenCalledWith({
      getSignableTransferRequest: {
        amount: ethAmount.amount,
        receiver: exchangeTransferRequest.receiver,
        sender: mockUser.etherKey,
        token: {
          data: {
            decimals: 18,
          },
          type: ethAmount.type,
        },
      },
      id: exchangeTransferRequest.transactionID,
    });
    expect(mockStarkSigner.getAddress).toHaveBeenCalled();
    expect(response).toEqual({
      sent_signature: mockCreateExchangeTransferResponse.data.sent_signature,
      status: mockCreateExchangeTransferResponse.data.status,
      time: mockCreateExchangeTransferResponse.data.time,
      transfer_id: mockCreateExchangeTransferResponse.data.transfer_id,
    });
  });

  it('should return error if failed to call public api', async () => {
    getExchangeSignableTransferMock.mockRejectedValue(
      new Error('Server is down')
    );

    await expect(() =>
      exchangeTransfer({
        user: mockUser,
        starkSigner: mockStarkSigner,
        request: exchangeTransferRequest,
        exchangesApi: exchangesApiMock,
      })
    ).rejects.toThrowError('Server is down');
  });
});
