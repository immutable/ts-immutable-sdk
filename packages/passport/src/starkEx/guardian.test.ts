import { ConfirmationScreen } from 'confirmation';
import * as guardian from '@imtbl/guardian';
import GuardianClient from './guardian';

jest.mock('@imtbl/guardian');
jest.mock('../confirmation/confirmation');

describe('guardian', () => {
  afterEach(jest.resetAllMocks);
  let mockGetTransactionByID: jest.Mock;
  let mockEvaluateStarkexTransaction: jest.Mock;

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
  const mockAccessToken = 'eyJh1234';
  const mockConfirmationScreen = new ConfirmationScreen({} as any);
  const mockImxPublicApiDomain = 'https://api.example.com';

  describe('validate', () => {
    it('should retry getting transaction details and throw an error when transaction does not exist', async () => {
      mockGetTransactionByID.mockResolvedValue({ data: { id: '1234' } });
      mockEvaluateStarkexTransaction.mockResolvedValue({ data: { confirmationRequired: false } });

      const guardianClient = new GuardianClient({
        accessToken: mockAccessToken,
        imxPublicApiDomain: mockImxPublicApiDomain,
        confirmationScreen: mockConfirmationScreen,
      });
      await guardianClient.validate({ payloadHash: 'hash' });
      expect(mockConfirmationScreen.startGuardianTransaction).toBeCalledTimes(0);
    });
    it('should not show the confirmation screen if it is not required', async () => {
      mockGetTransactionByID.mockResolvedValue({ data: { id: '1234' } });
      mockEvaluateStarkexTransaction.mockResolvedValue({ data: { confirmationRequired: false } });
      const guardianClient = new GuardianClient({
        accessToken: mockAccessToken,
        imxPublicApiDomain: mockImxPublicApiDomain,
        confirmationScreen: mockConfirmationScreen,
      });
      await guardianClient.validate({ payloadHash: 'hash' });

      expect(mockConfirmationScreen.startGuardianTransaction).toBeCalledTimes(0);
    });
    it('should show the confirmation screen when some of the confirmations are required', async () => {
      mockGetTransactionByID.mockResolvedValueOnce({ data: { id: '1234' } });
      mockEvaluateStarkexTransaction
        .mockResolvedValueOnce({ data: { confirmationRequired: true } });
      (mockConfirmationScreen.startGuardianTransaction as jest.Mock).mockResolvedValueOnce({ confirmed: true });

      const guardianClient = new GuardianClient({
        accessToken: mockAccessToken,
        imxPublicApiDomain: mockImxPublicApiDomain,
        confirmationScreen: mockConfirmationScreen,
      });
      await guardianClient.validate({ payloadHash: 'hash' });

      expect(mockConfirmationScreen.startGuardianTransaction).toHaveBeenCalledWith('hash');
    });

    it('should throw error if user did not confirm the transaction', async () => {
      mockGetTransactionByID.mockResolvedValueOnce({ data: { id: '1234' } });
      mockEvaluateStarkexTransaction
        .mockResolvedValueOnce({ data: { confirmationRequired: true } });
      (mockConfirmationScreen.startGuardianTransaction as jest.Mock).mockResolvedValueOnce({ confirmed: false });

      const guardianClient = new GuardianClient({
        accessToken: mockAccessToken,
        imxPublicApiDomain: mockImxPublicApiDomain,
        confirmationScreen: mockConfirmationScreen,
      });
      expect(guardianClient.validate({ payloadHash: 'hash' })).rejects.toThrow('Transaction rejected by user');
    });
  });
});
