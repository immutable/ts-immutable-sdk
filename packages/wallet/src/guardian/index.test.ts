import { AxiosError, AxiosResponse } from 'axios';
import GuardianClient from './index';
import { JsonRpcError, RpcErrorCode } from '../zkEvm/JsonRpcError';
import { WalletConfiguration } from '../config';
import { MetaTransaction } from '../zkEvm/types';

// Minimal stubs so the constructor doesn't fail
jest.mock('../confirmation/confirmation', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    loading: jest.fn(),
    closeWindow: jest.fn(),
  })),
}));

const mockUser = {
  zkEvm: { ethAddress: '0xabc', userAdminKey: '0xkey' },
  accessToken: 'test-token',
};

const mockGetUser = jest.fn().mockResolvedValue(mockUser);

const mockEvaluateTransaction = jest.fn();
const mockGuardianApi = {
  evaluateTransaction: mockEvaluateTransaction,
} as any;

const baseConfig = {
  crossSdkBridgeEnabled: false,
} as unknown as WalletConfiguration;

const metaTransactions: MetaTransaction[] = [
  {
    to: '0xcontract',
    data: '0x1234',
    value: BigInt(0),
    delegateCall: false,
    revertOnError: true,
  },
];

const evalParams = {
  chainId: 'eip155:13372',
  nonce: '1',
  metaTransactions,
};

function makeAxiosError(status: number, data?: unknown): AxiosError {
  const error = new AxiosError('Request failed');
  error.response = {
    status,
    data,
    headers: {},
    config: {} as any,
    statusText: '',
  } as AxiosResponse;
  return error;
}

function makeClient(crossSdkBridgeEnabled: boolean): GuardianClient {
  return new GuardianClient({
    config: { ...baseConfig, crossSdkBridgeEnabled } as WalletConfiguration,
    getUser: mockGetUser,
    guardianApi: mockGuardianApi,
    passportDomain: 'https://passport.immutable.com',
    clientId: 'test-client',
  });
}

describe('GuardianClient.evaluateEVMTransaction — 422 handling', () => {
  describe('when Guardian returns 422 and crossSdkBridgeEnabled is true (game bridge)', () => {
    it('throws TRANSACTION_REVERTED with the revert reason from the response', async () => {
      mockEvaluateTransaction.mockRejectedValue(
        makeAxiosError(422, { message: 'execution reverted: ERC20: transfer amount exceeds balance' }),
      );

      const client = makeClient(true);

      await expect(
        (client as any).evaluateEVMTransaction(evalParams),
      ).rejects.toMatchObject({
        code: RpcErrorCode.TRANSACTION_REVERTED,
        message: expect.stringContaining('execution reverted: ERC20: transfer amount exceeds balance'),
      });
    });

    it('throws TRANSACTION_REVERTED with a fallback message when the response has no message field', async () => {
      mockEvaluateTransaction.mockRejectedValue(makeAxiosError(422, {}));

      const client = makeClient(true);

      await expect(
        (client as any).evaluateEVMTransaction(evalParams),
      ).rejects.toMatchObject({
        code: RpcErrorCode.TRANSACTION_REVERTED,
        message: expect.stringContaining('Transaction will revert:'),
      });
    });

    it('throws a JsonRpcError instance', async () => {
      mockEvaluateTransaction.mockRejectedValue(
        makeAxiosError(422, { message: 'reverted' }),
      );

      const client = makeClient(true);

      await expect(
        (client as any).evaluateEVMTransaction(evalParams),
      ).rejects.toBeInstanceOf(JsonRpcError);
    });
  });

  describe('when Guardian returns 422 and crossSdkBridgeEnabled is false (web SDK)', () => {
    it('returns confirmationRequired: true instead of throwing', async () => {
      mockEvaluateTransaction.mockRejectedValue(
        makeAxiosError(422, { message: 'execution reverted' }),
      );

      const client = makeClient(false);

      const result = await (client as any).evaluateEVMTransaction(evalParams);

      expect(result).toEqual({ confirmationRequired: true });
    });
  });

  describe('when Guardian returns 403', () => {
    it('throws SERVICE_UNAVAILABLE_ERROR regardless of bridge flag', async () => {
      mockEvaluateTransaction.mockRejectedValue(makeAxiosError(403));

      const client = makeClient(false);

      await expect(
        (client as any).evaluateEVMTransaction(evalParams),
      ).rejects.toMatchObject({ type: 'SERVICE_UNAVAILABLE_ERROR' });
    });
  });

  describe('when Guardian returns an unexpected error', () => {
    it('throws INTERNAL_ERROR', async () => {
      mockEvaluateTransaction.mockRejectedValue(new Error('network timeout'));

      const client = makeClient(false);

      await expect(
        (client as any).evaluateEVMTransaction(evalParams),
      ).rejects.toMatchObject({ code: RpcErrorCode.INTERNAL_ERROR });
    });
  });
});
