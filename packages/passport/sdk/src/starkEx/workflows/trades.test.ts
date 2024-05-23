import { imx } from '@imtbl/generated-clients';
import { createTrade } from './trades';
import { mockErrorMessage, mockStarkSignature, mockUserImx } from '../../test/mocks';
import { PassportError, PassportErrorType } from '../../errors/passportError';
import GuardianClient from '../../guardian';

jest.mock('../../guardian');

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
  getYCoordinate: jest.fn(),
};

describe('Trades', () => {
  const mockGuardianClient = new GuardianClient({} as any);

  beforeEach(() => {
    (mockGuardianClient.withDefaultConfirmationScreenTask as jest.Mock).mockImplementation((task) => task);
  });

  describe('createTrade', () => {
    afterEach(jest.resetAllMocks);

    const mockGetSignableTrade = jest.fn();
    const mockCreateTrade = jest.fn();

    const mockTradesApi: imx.TradesApi = {
      getSignableTrade: mockGetSignableTrade,
      createTradeV3: mockCreateTrade,
    } as unknown as imx.TradesApi;

    it('should successfully create a trade ', async () => {
      mockGetSignableTrade.mockResolvedValue(mockSignableTradeResponse);
      mockStarkSigner.signMessage.mockResolvedValue(mockStarkSignature);
      mockCreateTrade.mockResolvedValue({
        data: mockReturnValue,
      });

      const result = await createTrade({
        tradesApi: mockTradesApi,
        starkSigner: mockStarkSigner,
        user: mockUserImx,
        request: mockSignableTradeRequest.getSignableTradeRequest,
        guardianClient: mockGuardianClient,
      });

      expect(mockGetSignableTrade).toBeCalledWith(mockSignableTradeRequest, mockHeader);
      expect(mockStarkSigner.signMessage).toBeCalledWith(mockPayloadHash);
      expect(mockGuardianClient.withDefaultConfirmationScreenTask).toBeCalled();
      expect(mockGuardianClient.evaluateImxTransaction)
        .toBeCalledWith({ payloadHash: mockPayloadHash });
      expect(mockCreateTrade).toBeCalledWith(
        mockCreateTradeRequest,
        mockHeader,
      );
      expect(result).toEqual(mockReturnValue);
    });

    it('should return error if transfer is rejected by user', async () => {
      mockGetSignableTrade.mockResolvedValue(mockSignableTradeResponse);
      (mockGuardianClient.evaluateImxTransaction as jest.Mock).mockRejectedValue(new Error('Transaction rejected by user'));

      await expect(() => createTrade({
        tradesApi: mockTradesApi,
        starkSigner: mockStarkSigner,
        user: mockUserImx,
        request: mockSignableTradeRequest.getSignableTradeRequest,
        guardianClient: mockGuardianClient,
      })).rejects.toThrowError('Transaction rejected by user');

      expect(mockGuardianClient.withDefaultConfirmationScreenTask).toBeCalled();
      expect(mockGuardianClient.evaluateImxTransaction)
        .toBeCalledWith({ payloadHash: mockPayloadHash });
    });

    it('should return error if failed to call public api', async () => {
      mockGetSignableTrade.mockRejectedValue(new Error(mockErrorMessage));

      await expect(() => createTrade({
        tradesApi: mockTradesApi,
        starkSigner: mockStarkSigner,
        user: mockUserImx,
        request: mockSignableTradeRequest.getSignableTradeRequest,
        guardianClient: mockGuardianClient,
      })).rejects.toThrow(
        new PassportError(
          mockErrorMessage,
          PassportErrorType.CREATE_TRADE_ERROR,
        ),
      );
    });
  });
});
