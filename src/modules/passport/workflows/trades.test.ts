import { StarkSigner, TradesApi } from '@imtbl/core-sdk';
import { createTrade } from './trades';

const mockStarkSignature = 'test_starkSignature';
const mockPayloadHash = 'test_payload_hash';
const mockAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2V4YW1wbGUuYXV0aDAuY29tLyIsImF1ZCI6Imh0dHBzOi8vYXBpLmV4YW1wbGUuY29tL2NhbGFuZGFyL3YxLyIsInN1YiI6InVzcl8xMjMiLCJpYXQiOjE0NTg3ODU3OTYsImV4cCI6MTQ1ODg3MjE5Nn0.CA7eaHjIHz5NxeIJoFK9krqaeZrPLwmMmgI_XiQiIkQ';
const mockEtherKey = '123';
const mockErrorMessage = 'Server is down'

const mockUser = {
  etherKey: mockEtherKey,
  accessToken: mockAccessToken,
  profile: {
    sub: '111',
  },
};
const mockSignableTradeRequest = {
  getSignableTradeRequest: {
    expiration_timestamp: 1231234,
    fees: [],
    order_id: 1234,
    user: mockEtherKey
  },
};
const mockSignableTradeResponseData = {
  amount_buy: '2',
  amount_sell: '1',
  asset_id_buy: '1234',
  asset_id_sell: '4321',
  expiration_timestamp: 0,
  fee_info: [],
  nonce: 0,
  stark_key: '0x1234',
  vault_id_buy: '0x02705737c',
  vault_id_sell: '0x04006590f',
}
const mockSignableTradeResponse = {
  data: {
    ...mockSignableTradeResponseData,
    payload_hash: mockPayloadHash,
    readable_transaction: 'test_readable_transaction',
    signable_message: 'test_signable_message',
    verification_signature: 'test_verification_signature'
  },
};
const mockCreateTradeRequest = {
  createTradeRequest: {
    ...mockSignableTradeResponseData,
    stark_signature: mockStarkSignature,
    fees: [],
    include_fees: true,
    order_id: 1234
  },
  // Notes[ID-451]: this is 2 params to bypass the Client non-empty check,
  // Should be able to remove it once the Backend have update the API
  // and generated the New Client
  xImxEthAddress: '',
  xImxEthSignature: '',
};
const mockHeader = {
  headers: {
    Authorization: `Bearer ${mockAccessToken}`,
  },
};
const mockReturnValue = {
  status: 'success',
  trade_id: 123,
};

describe('trades', () => {
    describe('createTrade', () => {
      let getSignableTradeMock: jest.Mock;
      let createTradeMock: jest.Mock;
      let signMessageMock: jest.Mock;
      let getAddressMock: jest.Mock;

      let tradesApiMock: TradesApi;
      let starkSigner: StarkSigner;

      beforeEach(() => {
        getSignableTradeMock = jest.fn();
        createTradeMock = jest.fn();
        signMessageMock = jest.fn();
        getAddressMock = jest.fn();

        tradesApiMock = {
          getSignableTrade: getSignableTradeMock,
          createTrade: createTradeMock,
        } as unknown as TradesApi;

        starkSigner = {
          signMessage: signMessageMock,
          getAddress: getAddressMock,
        };
      });

      afterEach(jest.resetAllMocks);

      it('should successfully create a trade ', async () => {
        getSignableTradeMock.mockResolvedValue(mockSignableTradeResponse);
        signMessageMock.mockResolvedValue(mockStarkSignature);
        createTradeMock.mockResolvedValue({
          data: mockReturnValue,
        });

        const result = await createTrade({
          tradesApi: tradesApiMock,
          starkSigner,
          user: mockUser,
          request: mockSignableTradeRequest.getSignableTradeRequest
        });

        expect(getSignableTradeMock).toBeCalledWith(
          mockSignableTradeRequest
        );
        expect(signMessageMock).toBeCalledWith(mockPayloadHash);
        expect(createTradeMock).toBeCalledWith(
          mockCreateTradeRequest,
          mockHeader
        );
        expect(result).toEqual(mockReturnValue);
      });

      it('should return error if failed to call public api', async () => {
        getSignableTradeMock.mockRejectedValue(new Error(mockErrorMessage));

        await expect(() =>
          createTrade({
            tradesApi: tradesApiMock,
            starkSigner,
            user: mockUser,
            request: mockSignableTradeRequest.getSignableTradeRequest
          })
        ).rejects.toThrowError(mockErrorMessage);
      });
    })
  }
)
