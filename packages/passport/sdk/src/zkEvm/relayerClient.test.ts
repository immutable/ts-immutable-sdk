import { JsonRpcApiProvider, JsonRpcProvider } from 'ethers';
import AuthManager from '../authManager';
import { RelayerClient } from './relayerClient';
import { PassportConfiguration } from '../config';
import { UserZkEvm } from '../types';
import { RelayerTransactionStatus, TypedDataPayload } from './types';
import { chainId, chainIdEip155 } from '../test/mocks';

describe('relayerClient', () => {
  const transactionHash = '0x456';
  const config = {
    relayerUrl: 'https://example.com',
  };
  const user = {
    accessToken: 'accessToken123',
  };

  const rpcProvider: Partial<JsonRpcApiProvider> = {
    getNetwork: jest.fn().mockResolvedValue({ chainId, name: '' }),
  };
  const relayerClient = new RelayerClient({
    config: config as PassportConfiguration,
    rpcProvider: rpcProvider as JsonRpcProvider,
    authManager: {
      getUserZkEvm: jest.fn().mockResolvedValue(user as UserZkEvm),
    } as unknown as AuthManager,
  });

  let originalFetch: any;
  beforeAll(() => {
    originalFetch = global.fetch;
    global.fetch = jest.fn();
  });

  afterEach(jest.clearAllMocks);

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe('ethSendTransaction', () => {
    it('calls relayer with the correct arguments', async () => {
      const to = '0xd64b0d2d72bb1b3f18046b8a7fc6c9ee6bccd287';
      const data = '0x123';

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ result: transactionHash })),
        json: () => ({
          result: transactionHash,
        }),
      });

      const result = await relayerClient.ethSendTransaction(to, data);
      expect(result).toEqual(transactionHash);
      expect(global.fetch).toHaveBeenCalledWith(`${config.relayerUrl}/v1/transactions`, expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
      }));
      expect(JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)).toMatchObject({
        id: 1,
        jsonrpc: '2.0',
        method: 'eth_sendTransaction',
        params: [{
          to,
          data,
          chainId: chainIdEip155,
        }],
      });
    });

    it('throws error from JSON response when response contains error field', async () => {
      const to = '0xd64b0d2d72bb1b3f18046b8a7fc6c9ee6bccd287';
      const data = '0x123';

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: () => Promise.resolve('{"error":"invalid_token"}'),
      });

      await expect(relayerClient.ethSendTransaction(to, data)).rejects.toThrow(
        'invalid_token',
      );
    });

    it('throws HTTP error for non-ok response without error field', async () => {
      const to = '0xd64b0d2d72bb1b3f18046b8a7fc6c9ee6bccd287';
      const data = '0x123';

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('{"result":"some_result"}'),
      });

      await expect(relayerClient.ethSendTransaction(to, data)).rejects.toThrow(
        'Relayer HTTP error: 500. Content: "{"result":"some_result"}"',
      );
    });

    it('throws JSON parse error for invalid response', async () => {
      const to = '0xd64b0d2d72bb1b3f18046b8a7fc6c9ee6bccd287';
      const data = '0x123';

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('invalid json'),
      });

      await expect(relayerClient.ethSendTransaction(to, data)).rejects.toThrow(
        'Relayer JSON parse error: Unexpected token \'i\', "invalid json" is not valid JSON. Content: "invalid json"',
      );
    });
  });

  describe('imGetTransactionByHash', () => {
    it('calls relayer with the correct arguments', async () => {
      const relayerId = '0x789';
      const relayerTransaction = {
        status: RelayerTransactionStatus.SUCCESSFUL,
        chainId,
        relayerId,
        hash: transactionHash,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ result: relayerTransaction })),
        json: () => ({
          result: relayerTransaction,
        }),
      });

      const result = await relayerClient.imGetTransactionByHash(transactionHash);
      expect(result).toEqual(relayerTransaction);
      expect(global.fetch).toHaveBeenCalledWith(`${config.relayerUrl}/v1/transactions`, expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
      }));
      expect(JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)).toMatchObject({
        id: 1,
        jsonrpc: '2.0',
        method: 'im_getTransactionByHash',
        params: [transactionHash],
      });
    });
  });

  describe('imGetFeeOptions', () => {
    it('calls relayer with the correct arguments', async () => {
      const userAddress = '0xd64b0d2d72bb1b3f18046b8a7fc6c9ee6bccd287';
      const data = '0x123';

      const feeOptions = [{
        tokenPrice: '0x64',
        tokenSymbol: 'IMX',
        tokenDecimals: 18,
        recipientAddress: '0xf5102ff309F690F16Fd7B9b3c7eC5e0d5eA502f1',
      }];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ result: feeOptions })),
        json: () => ({
          result: feeOptions,
        }),
      });

      const result = await relayerClient.imGetFeeOptions(userAddress, data);
      expect(result).toEqual(feeOptions);
      expect(global.fetch).toHaveBeenCalledWith(`${config.relayerUrl}/v1/transactions`, expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
      }));
      expect(JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)).toMatchObject({
        id: 1,
        jsonrpc: '2.0',
        method: 'im_getFeeOptions',
        params: [{
          userAddress,
          data,
          chainId: chainIdEip155,
        }],
      });
    });
  });

  describe('imSignTypedData', () => {
    it('calls relayer with the correct arguments', async () => {
      const address = '0xd64b0d2d72bb1b3f18046b8a7fc6c9ee6bccd287';
      const eip712Payload = {} as TypedDataPayload;
      const relayerSignature = '0x123';

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ result: relayerSignature })),
        json: () => ({
          result: relayerSignature,
        }),
      });

      const result = await relayerClient.imSignTypedData(address, eip712Payload);
      expect(result).toEqual(relayerSignature);
      expect(global.fetch).toHaveBeenCalledWith(`${config.relayerUrl}/v1/transactions`, expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
      }));
      expect(JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)).toMatchObject({
        id: 1,
        jsonrpc: '2.0',
        method: 'im_signTypedData',
        params: [{
          address,
          eip712Payload,
          chainId: chainIdEip155,
        }],
      });
    });
  });

  describe('imSign', () => {
    it('calls relayer with the correct arguments', async () => {
      const address = '0xd64b0d2d72bb1b3f18046b8a7fc6c9ee6bccd287';
      const message = 'hello';
      const relayerSignature = '0x123';

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ result: relayerSignature })),
        json: () => ({
          result: relayerSignature,
        }),
      });

      const result = await relayerClient.imSign(address, message);

      expect(result).toEqual(relayerSignature);
      expect(global.fetch).toHaveBeenCalledWith(`${config.relayerUrl}/v1/transactions`, expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
      }));
      expect(JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)).toMatchObject({
        id: 1,
        jsonrpc: '2.0',
        method: 'im_sign',
        params: [{
          address,
          message,
          chainId: chainIdEip155,
        }],
      });
    });
  });
});
