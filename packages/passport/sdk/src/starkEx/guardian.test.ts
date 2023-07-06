import { ConfirmationScreen } from 'confirmation';
import * as guardian from '@imtbl/guardian';
import GuardianClient from './guardian';

jest.mock('@imtbl/guardian');
jest.mock('../confirmation/confirmation');

describe('guardian', () => {
  afterEach(jest.resetAllMocks);
  let mockGetTransactionByID: jest.Mock;
  let mockEvaluateTransaction: jest.Mock;

  beforeEach(() => {
    mockGetTransactionByID = jest.fn();
    mockEvaluateTransaction = jest.fn();
    (guardian.TransactionsApi as jest.Mock).mockImplementation(() => ({
      getTransactionByID: mockGetTransactionByID,
      evaluateTransaction: mockEvaluateTransaction,
    }));
  });
  const mockAccessToken = 'eyJh1234';
  const mockEtherAddress = '0x1234';
  const mockConfirmationScreen = new ConfirmationScreen({} as any);
  const mockImxPublicApiDomain = 'https://api.example.com';

  describe('validate', () => {
    it('should retry getting transaction details and throw an error when transaction does not exist', async () => {
      mockGetTransactionByID.mockResolvedValue({ data: { id: '1234' } });
      mockEvaluateTransaction.mockResolvedValue({ data: { confirmationRequired: false } });

      const guardianClient = new GuardianClient({
        accessToken: mockAccessToken,
        imxPublicApiDomain: mockImxPublicApiDomain,
        confirmationScreen: mockConfirmationScreen,
        imxEtherAddress: mockEtherAddress,
      });
      await guardianClient.validate({ payloadHash: 'hash' });
      expect(mockConfirmationScreen.startGuardianTransaction).toBeCalledTimes(0);
    });
    it('should not show the confirmation screen if it is not required', async () => {
      mockGetTransactionByID.mockResolvedValue({ data: { id: '1234' } });
      mockEvaluateTransaction.mockResolvedValue({ data: { confirmationRequired: false } });
      const guardianClient = new GuardianClient({
        accessToken: mockAccessToken,
        imxPublicApiDomain: mockImxPublicApiDomain,
        confirmationScreen: mockConfirmationScreen,
        imxEtherAddress: mockEtherAddress,

      });
      await guardianClient.validate({ payloadHash: 'hash' });

      expect(mockConfirmationScreen.startGuardianTransaction).toBeCalledTimes(0);
    });
    it('should show the confirmation screen when some of the confirmations are required', async () => {
      mockGetTransactionByID.mockResolvedValueOnce({ data: { id: '1234' } });
      mockEvaluateTransaction
        .mockResolvedValueOnce({ data: { confirmationRequired: true } });
      (mockConfirmationScreen.startGuardianTransaction as jest.Mock).mockResolvedValueOnce({ confirmed: true });

      const guardianClient = new GuardianClient({
        accessToken: mockAccessToken,
        imxPublicApiDomain: mockImxPublicApiDomain,
        confirmationScreen: mockConfirmationScreen,
        imxEtherAddress: mockEtherAddress,
      });
      await guardianClient.validate({ payloadHash: 'hash' });

      expect(mockConfirmationScreen.startGuardianTransaction).toHaveBeenCalledWith('hash', mockEtherAddress);
    });

    it('should throw error if user did not confirm the transaction', async () => {
      mockGetTransactionByID.mockResolvedValueOnce({ data: { id: '1234' } });
      mockEvaluateTransaction
        .mockResolvedValueOnce({ data: { confirmationRequired: true } });
      (mockConfirmationScreen.startGuardianTransaction as jest.Mock).mockResolvedValueOnce({ confirmed: false });

      const guardianClient = new GuardianClient({
        accessToken: mockAccessToken,
        imxPublicApiDomain: mockImxPublicApiDomain,
        confirmationScreen: mockConfirmationScreen,
        imxEtherAddress: mockEtherAddress,
      });
      expect(guardianClient.validate({ payloadHash: 'hash' })).rejects.toThrow('Transaction rejected by user');
    });
  });
});
