import { StarkSigner, TransfersApi, UnsignedTransferRequest, } from '@imtbl/core-sdk';
import transfer from './transfer';

describe('transfer', () => {
  let signMessageMock: jest.Mock;
  let getSignableTransferV1Mock: jest.Mock;
  let createTransferV1Mock: jest.Mock;
  let transferApiMock: TransfersApi;
  let starkSigner: StarkSigner;
  const mockUser = {
    etherKey: '123',
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2V4YW1wbGUuYXV0aDAuY29tLyIsImF1ZCI6Imh0dHBzOi8vYXBpLmV4YW1wbGUuY29tL2NhbGFuZGFyL3YxLyIsInN1YiI6InVzcl8xMjMiLCJpYXQiOjE0NTg3ODU3OTYsImV4cCI6MTQ1ODg3MjE5Nn0.CA7eaHjIHz5NxeIJoFK9krqaeZrPLwmMmgI_XiQiIkQ',
    profile: {
      sub: "111"
    }
  };
  const mockReceiver = 'AAA';
  const type = 'ERC721';
  const tokenId = '111';
  const tokenAddress = '0x1234';
  const starkSignature = 'starkSignature';
  const mockTransferRequest = {
    type,
    tokenId,
    tokenAddress,
    receiver: mockReceiver,
  };

  beforeEach(() => {
    signMessageMock = jest.fn();

    starkSigner = {
      signMessage: signMessageMock,
      getAddress: jest.fn(),
    };

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
        sender: mockUser.etherKey,
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
    const { payload_hash: mockPayloadHash, ...restSignableTransferV1Response } =
      mockSignableTransferV1Response.data;
    const mockCreateTransferRequest = {
      createTransferRequest: {
        ...restSignableTransferV1Response,
        stark_signature: starkSignature,
      },
    };
    const mockHeader = {
      headers: {
        Authorization: `Bearer ${mockUser.accessToken}`,
      },
    };
    const mockReturnValue = {
      sent_signature: '0x1c8aff950685c2ed4bc3174f3472287b56d95',
      status: 'success',
      time: 111,
      transfer_id: 123,
    };

    getSignableTransferV1Mock.mockResolvedValue(mockSignableTransferV1Response);
    signMessageMock.mockResolvedValue(starkSignature);
    createTransferV1Mock.mockResolvedValue({
      data: mockReturnValue,
    });

    const result = await transfer({
      transferApi: transferApiMock,
      starkSigner,
      user: mockUser,
      request: mockTransferRequest as UnsignedTransferRequest,
    }, { passportDomain: "test.com" });

    expect(getSignableTransferV1Mock).toBeCalledWith(
      mockSignableTransferRequest
    );
    expect(signMessageMock).toBeCalledWith(mockPayloadHash);
    expect(createTransferV1Mock).toBeCalledWith(
      mockCreateTransferRequest,
      mockHeader
    );
    expect(result).toEqual(mockReturnValue);
  });

  it('should return error if failed to call public api', async () => {
    getSignableTransferV1Mock.mockRejectedValue(new Error('Server is down'));

    await expect(() =>
      transfer(
        {
          transferApi: transferApiMock,
          starkSigner,
          user: mockUser,
          request: mockTransferRequest as UnsignedTransferRequest,
        }, { passportDomain: "test.com" }
      )
    ).rejects.toThrowError('Server is down');
  });
});
