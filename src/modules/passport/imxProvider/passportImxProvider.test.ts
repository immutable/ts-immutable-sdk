import PassportImxProvider from './passportImxProvider';
import { TransfersApi, UnsignedTransferRequest } from '@imtbl/core-sdk';

jest.mock('@imtbl/core-sdk', () => {
  const original = jest.requireActual('@imtbl/core-sdk');
  return {
    ...original,
    TransfersApi: jest.fn(),
  };
});

describe('PassportImxProvider', () => {
  let passportImxProvider: PassportImxProvider;
  let signMessageMock: jest.Mock;
  let getSignableTransferV1Mock: jest.Mock;
  let createTransferV1Mock: jest.Mock;
  const ethAddress = '123';
  const mockJwt = {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2V4YW1wbGUuYXV0aDAuY29tLyIsImF1ZCI6Imh0dHBzOi8vYXBpLmV4YW1wbGUuY29tL2NhbGFuZGFyL3YxLyIsInN1YiI6InVzcl8xMjMiLCJpYXQiOjE0NTg3ODU3OTYsImV4cCI6MTQ1ODg3MjE5Nn0.CA7eaHjIHz5NxeIJoFK9krqaeZrPLwmMmgI_XiQiIkQ',
  };

  beforeEach(() => {
    signMessageMock = jest.fn();

    const starkSigner = {
      signMessage: signMessageMock,
      getAddress: jest.fn(),
    };

    getSignableTransferV1Mock = jest.fn();
    createTransferV1Mock = jest.fn();
    (TransfersApi as jest.Mock).mockReturnValue({
      getSignableTransferV1: getSignableTransferV1Mock,
      createTransferV1: createTransferV1Mock,
    });

    passportImxProvider = new PassportImxProvider({
      jwt: mockJwt,
      starkSigner,
      ethAddress,
    });
  });

  describe('transfer', () => {
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

    it('should returns success transfer result', async () => {
      const mockSignableTransferRequest = {
        getSignableTransferRequest: {
          amount: '1',
          receiver: mockReceiver,
          sender: ethAddress,
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
          stark_signature: starkSignature,
        },
        xImxEthAddress: '',
        xImxEthSignature: '',
      };
      const mockHeader = {
        headers: {
          Authorization: `Bearer ${mockJwt.accessToken}`,
        },
      };
      const mockReturnValue = {
        sent_signature: '0x1c8aff950685c2ed4bc3174f3472287b56d95',
        status: 'success',
        time: 111,
        transfer_id: 123,
      };

      getSignableTransferV1Mock.mockResolvedValue(
        mockSignableTransferV1Response
      );
      signMessageMock.mockResolvedValue(starkSignature);
      createTransferV1Mock.mockResolvedValue({
        data: mockReturnValue,
      });

      const result = await passportImxProvider.transfer(
        mockTransferRequest as UnsignedTransferRequest
      );

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
        passportImxProvider.transfer(
          mockTransferRequest as UnsignedTransferRequest
        )
      ).rejects.toThrowError('Server is down');
    });
  });

  describe('registerOffchain', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.registerOffchain).toThrowError();
    });
  });

  describe('isRegisteredOnchain', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.isRegisteredOnchain).toThrowError();
    });
  });

  describe('createOrder', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.createOrder).toThrowError();
    });
  });

  describe('cancelOrder', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.cancelOrder).toThrowError();
    });
  });

  describe('createTrade', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.createTrade).toThrowError();
    });
  });

  describe('batchNftTransfer', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.batchNftTransfer).toThrowError();
    });
  });

  describe('exchangeTransfer', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.exchangeTransfer).toThrowError();
    });
  });

  describe('deposit', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.deposit).toThrowError();
    });
  });

  describe('prepareWithdrawal', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.prepareWithdrawal).toThrowError();
    });
  });

  describe('completeWithdrawal', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.completeWithdrawal).toThrowError();
    });
  });
});
