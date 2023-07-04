import { TradesApi } from '@imtbl/core-sdk';
import { createTrade } from './trades';
import { mockErrorMessage, mockStarkSignature, mockUserImx } from '../../test/mocks';
import { PassportError, PassportErrorType } from '../../errors/passportError';
import GuardianClient from '../guardian';

jest.mock('../guardian');

const mockPayloadHash = 'test_payload_hash';
const mockSignableTradeRequest = {
  getSignableTradeRequest: {
    expiration_timestamp: 1231234,
    fees: [],
    order_id: 1234,
    user: mockUserImx.imx.ethAddress,
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
};
const mockSignableTradeResponse = {
  data: {
    ...mockSignableTradeResponseData,
    payload_hash: mockPayloadHash,
    readable_transaction: 'test_readable_transaction',
    signable_message: 'test_signable_message',
    verification_signature: 'test_verification_signature',
  },
};
const mockCreateTradeRequest = {
  createTradeRequest: {
    ...mockSignableTradeResponseData,
    stark_signature: mockStarkSignature,
    fees: [],
    include_fees: true,
    order_id: 1234,
  },
};
const mockHeader = {
  headers: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Authorization: `Bearer ${mockUserImx.accessToken}`,
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
  const mockGuardianClient = new GuardianClient({} as any);
  describe('createTrade', () => {
    afterEach(jest.resetAllMocks);

    const getSignableTradeMock = jest.fn();
    const createTradeMock = jest.fn();

    const tradesApiMock: TradesApi = {
      getSignableTrade: getSignableTradeMock,
      createTradeV3: createTradeMock,
    } as unknown as TradesApi;

    it('should successfully create a trade ', async () => {
      getSignableTradeMock.mockResolvedValue(mockSignableTradeResponse);
      mockStarkSigner.signMessage.mockResolvedValue(mockStarkSignature);
      createTradeMock.mockResolvedValue({
        data: mockReturnValue,
      });

      const result = await createTrade({
        tradesApi: tradesApiMock,
        starkSigner: mockStarkSigner,
        user: mockUserImx,
        request: mockSignableTradeRequest.getSignableTradeRequest,
        guardianClient: mockGuardianClient,
      });

      expect(getSignableTradeMock).toBeCalledWith(mockSignableTradeRequest, mockHeader);
      expect(mockStarkSigner.signMessage).toBeCalledWith(mockPayloadHash);
      expect(mockGuardianClient.loading).toBeCalled();
      expect(mockGuardianClient.validate).toBeCalledWith({ payloadHash: mockPayloadHash });
      expect(createTradeMock).toBeCalledWith(
        mockCreateTradeRequest,
        mockHeader,
      );
      expect(result).toEqual(mockReturnValue);
    });

    it('should return error if transfer is rejected by user', async () => {
      getSignableTradeMock.mockResolvedValue(mockSignableTradeResponse);
      (mockGuardianClient.validate as jest.Mock).mockRejectedValue(new Error('Transaction rejected by user'));
      await expect(() => createTrade({
        tradesApi: tradesApiMock,
        starkSigner: mockStarkSigner,
        user: mockUserImx,
        request: mockSignableTradeRequest.getSignableTradeRequest,
        guardianClient: mockGuardianClient,
      })).rejects.toThrowError('Transaction rejected by user');
      expect(mockGuardianClient.loading).toBeCalled();
      expect(mockGuardianClient.validate).toBeCalledWith({ payloadHash: mockPayloadHash });
    });

    it('should return error if failed to call public api', async () => {
      getSignableTradeMock.mockRejectedValue(new Error(mockErrorMessage));

      await expect(() => createTrade({
        tradesApi: tradesApiMock,
        starkSigner: mockStarkSigner,
        user: mockUserImx,
        request: mockSignableTradeRequest.getSignableTradeRequest,
        guardianClient: mockGuardianClient,
      })).rejects.toThrow(
        new PassportError(
          `${PassportErrorType.CREATE_TRADE_ERROR}: ${mockErrorMessage}`,
          PassportErrorType.CREATE_TRADE_ERROR,
        ),
      );
    });
  });
});
