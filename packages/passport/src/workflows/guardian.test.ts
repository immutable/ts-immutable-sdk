import { ConfirmationScreen } from 'confirmation';
import * as guardian from '@imtbl/guardian';
import { batchValidateWithGuardian, validateWithGuardian } from './guardian';

jest.mock('@imtbl/guardian');
jest.mock('../confirmation/confirmation');

describe('validateWithGuardian', () => {
  afterEach(jest.resetAllMocks);
  let mockGetTransactionByID: jest.Mock;
  let mockEvaluateStarkexTransaction: jest.Mock;

  const mockConfirmationScreen = new ConfirmationScreen({} as any);

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
  it('should retry getting transaction details and throw an error when transaction does not exist', async () => {
    mockGetTransactionByID
      .mockRejectedValueOnce({ message: 'Internal server error' })
      .mockResolvedValueOnce({ data: { id: null } });
    mockEvaluateStarkexTransaction.mockResolvedValueOnce({ data: { confirmationRequired: true } });

    await expect(validateWithGuardian({
      accessToken: '1234',
      imxPublicApiDomain: 'https://api.example.com',
      payloadHash: 'hash',
      confirmationScreen: mockConfirmationScreen,
    })).rejects.toThrow("Transaction doesn't exists");
  });

  it('should not show the confirmation screen if it is not required', async () => {
    mockGetTransactionByID.mockResolvedValue({ data: { id: '1234' } });
    mockEvaluateStarkexTransaction.mockResolvedValue({ data: { confirmationRequired: false } });

    await validateWithGuardian({
      accessToken: '1234',
      imxPublicApiDomain: 'https://api.example.com',
      payloadHash: 'hash',
      confirmationScreen: mockConfirmationScreen,
    });

    expect(mockConfirmationScreen.startGuardianTransaction).toBeCalledTimes(0);
  });

  it('should show the confirmation screen when some of the confirmations are required', async () => {
    mockGetTransactionByID.mockResolvedValueOnce({ data: { id: '1234' } });
    mockEvaluateStarkexTransaction
      .mockResolvedValueOnce({ data: { confirmationRequired: true } });
    (mockConfirmationScreen.startGuardianTransaction as jest.Mock).mockResolvedValueOnce({ confirmed: true });

    await validateWithGuardian({
      accessToken: '1234',
      imxPublicApiDomain: 'https://api.example.com',
      payloadHash: 'hash',
      confirmationScreen: mockConfirmationScreen,
    });

    expect(mockConfirmationScreen.startGuardianTransaction).toHaveBeenCalledWith('hash');
  });
});

describe('batchValidateWithGuardian', () => {
  afterEach(jest.resetAllMocks);
  let mockGetTransactionByID: jest.Mock;
  let mockEvaluateStarkexTransaction: jest.Mock;

  const mockConfirmationScreen = new ConfirmationScreen({} as any);

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
  it('should throw an error for empty payloadHashs array', async () => {
    await expect(batchValidateWithGuardian({
      accessToken: '1234',
      imxPublicApiDomain: 'https://api.example.com',
      payloadHashs: [],
      confirmationScreen: mockConfirmationScreen,
    })).rejects.toThrow("Transaction doesn't exists");
  });

  it('should retry getting transaction details and throw an error when transaction does not exist', async () => {
    mockGetTransactionByID
      .mockRejectedValueOnce({ message: 'Internal server error' })
      .mockResolvedValueOnce({ data: { id: null } });
    mockEvaluateStarkexTransaction.mockResolvedValueOnce({ data: { confirmationRequired: true } });

    await expect(batchValidateWithGuardian({
      accessToken: '1234',
      imxPublicApiDomain: 'https://api.example.com',
      payloadHashs: ['hash1'],
      confirmationScreen: mockConfirmationScreen,
    })).rejects.toThrow("Transaction doesn't exists");
  });

  it('should not show the confirmation screen if at least one confirmation is not required', async () => {
    mockGetTransactionByID.mockResolvedValue({ data: { id: '1234' } });
    mockEvaluateStarkexTransaction.mockResolvedValue({ data: { confirmationRequired: false } });

    await batchValidateWithGuardian({
      accessToken: '1234',
      imxPublicApiDomain: 'https://api.example.com',
      payloadHashs: ['hash1', 'hash2'],
      confirmationScreen: mockConfirmationScreen,
    });

    expect(mockConfirmationScreen.startGuardianTransaction).toBeCalledTimes(0);
  });

  it('should show the confirmation screen when some of the confirmations are required', async () => {
    mockGetTransactionByID.mockResolvedValueOnce({ data: { id: '1234' } }).mockResolvedValueOnce({ data: { id: '5678' } });
    mockEvaluateStarkexTransaction
      .mockResolvedValueOnce({ data: { confirmationRequired: true } })
      .mockResolvedValueOnce({ data: { confirmationRequired: true } });
    (mockConfirmationScreen.startGuardianTransaction as jest.Mock).mockResolvedValueOnce({ confirmed: true });

    await batchValidateWithGuardian({
      accessToken: '1234',
      imxPublicApiDomain: 'https://api.example.com',
      payloadHashs: ['hash1', 'hash2'],
      confirmationScreen: mockConfirmationScreen,
    });

    expect(mockConfirmationScreen.startGuardianTransaction).toHaveBeenCalledWith('hash1,hash2');
  });
});
