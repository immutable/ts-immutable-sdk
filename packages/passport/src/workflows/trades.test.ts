import { TradesApi } from '@imtbl/core-sdk';
import { createTrade } from './trades';
import { mockErrorMessage, mockStarkSignature, mockUser } from '../test/mocks';
import { PassportError, PassportErrorType } from '../errors/passportError';

const mockPayloadHash = 'test_payload_hash';
const mockSignableTradeRequest = {
  getSignableTradeRequest: {
    expiration_timestamp: 1231234,
    fees: [],
    order_id: 1234,
    user: mockUser.etherKey
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
  }
};
const mockHeader = {
  headers: {
    Authorization: `Bearer ${ mockUser.accessToken }`,
  },
};
const mockReturnValue = {
  status: 'success',
  trade_id: 123,
};
const mockStarkSigner = {
  signMessage: jest.fn(),
  getAddress: jest.fn(),
};
describe('trades', () => {
    describe('createTrade', () => {
      let getSignableTradeMock: jest.Mock;
      let createTradeMock: jest.Mock;

      let tradesApiMock: TradesApi;

      beforeEach(() => {
        getSignableTradeMock = jest.fn();
        createTradeMock = jest.fn();

        tradesApiMock = {
          getSignableTrade: getSignableTradeMock,
          createTrade: createTradeMock,
        } as unknown as TradesApi;
      });

      afterEach(jest.resetAllMocks);

      it('should successfully create a trade ', async () => {
        getSignableTradeMock.mockResolvedValue(mockSignableTradeResponse);
        mockStarkSigner.signMessage.mockResolvedValue(mockStarkSignature);
        createTradeMock.mockResolvedValue({
          data: mockReturnValue,
        });

        const result = await createTrade({
          tradesApi: tradesApiMock,
          starkSigner: mockStarkSigner,
          user: mockUser,
          request: mockSignableTradeRequest.getSignableTradeRequest
        });

        expect(getSignableTradeMock).toBeCalledWith(
          mockSignableTradeRequest
        );
        expect(mockStarkSigner.signMessage).toBeCalledWith(mockPayloadHash);
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
            starkSigner: mockStarkSigner,
            user: mockUser,
            request: mockSignableTradeRequest.getSignableTradeRequest
          })
        ).rejects.toThrow(
          new PassportError(
            `${ PassportErrorType.CREATE_TRADE_ERROR }: ${ mockErrorMessage }`,
            PassportErrorType.CREATE_TRADE_ERROR
          )
        );
      });
    })
  }
)
