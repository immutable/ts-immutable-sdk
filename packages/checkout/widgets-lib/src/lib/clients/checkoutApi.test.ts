/* eslint @typescript-eslint/naming-convention: off */
import axios, { AxiosError, HttpStatusCode } from 'axios';
import { Environment } from '@imtbl/config';
import { TransactionType } from './checkoutApiType';
import { CheckoutApi } from './checkoutApi';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CheckoutApi', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTransactions', () => {
    it('success', async () => {
      const mockResponse = {
        status: 200,
        data:
          {
            result: [
              {
                type: 'bridge',
                details: {
                  from_address: '0x1234567890',
                  from_chain: 'imtbl-zkevm-testnet',
                  amount: '100000000000000000',
                  from_token_address: 'native',
                  to_address: '0x1e8dc77bed0da06621e819fa0afb59d50f76cfdf',
                  to_chain: 'sepolia',
                  to_token_address: '0x60466acb9e525ae1e9978fd14197c8c419ba65e6',
                  current_status: {
                    status: 'in_progress',
                  },
                },
                blockchain_metadata: {
                  transaction_hash: '0x68d9eac5e3b3c3580404989a4030c948a78e1b07b2b5ea5688d8c38a6c61c93e',
                },
                updated_at: '2022-08-16T17:43:26.991388Z',
              },
            ],
          },
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const txType = TransactionType.BRIDGE;
      const fromAddress = '0x1234567890';
      const client = new CheckoutApi({ env: Environment.SANDBOX });
      const resp = await client.getTransactions({ fromAddress, txType });

      // should not contain native token data
      expect(resp.result.length).toEqual(1);
      expect(
        resp.result[0].blockchain_metadata.transaction_hash,
      ).toEqual('0x68d9eac5e3b3c3580404989a4030c948a78e1b07b2b5ea5688d8c38a6c61c93e');
      expect(resp.result[0].details.from_address).toEqual('0x1234567890');
      expect(resp.result[0].details.from_chain).toEqual('imtbl-zkevm-testnet');
      expect(resp.result[0].details.current_status.status).toEqual('in_progress');

      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        1,
        `${client.url}/v1/transactions?from_address=${fromAddress}&tx_type=${txType}`,
      );
    });

    it('success cached', async () => {
      const mockResponse = {
        status: 200,
        data:
          {
            result: [],
          },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const txType = TransactionType.BRIDGE;
      const fromAddress = '0x1234567890';
      const client = new CheckoutApi({ env: Environment.SANDBOX });
      const precache = await client.getTransactions({ fromAddress, txType });
      const cached = await client.getTransactions({ fromAddress, txType });

      expect(cached).toEqual(precache);

      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        1,
        `${client.url}/v1/transactions?from_address=${fromAddress}&tx_type=${txType}`,
      );
    });

    it('success zero TTL', async () => {
      const mockResponse = {
        status: 200,
        data:
          {
            result: [],
          },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const txType = TransactionType.BRIDGE;
      const fromAddress = '0x1234567890';
      const client = new CheckoutApi({ env: Environment.SANDBOX, ttl: 0 });
      const precache = await client.getTransactions({ fromAddress, txType });
      const cached = await client.getTransactions({ fromAddress, txType });

      expect(cached).toEqual(precache);

      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        2,
        `${client.url}/v1/transactions?from_address=${fromAddress}&tx_type=${txType}`,
      );
    });

    it('fails 400', async () => {
      const mockResponse = {
        status: HttpStatusCode.BadRequest,
        statusText: 'error',
        data: {},
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const txType = TransactionType.BRIDGE;
      const fromAddress = '0x1234567890';
      const client = new CheckoutApi({ env: Environment.SANDBOX });
      try {
        await client.getTransactions({ fromAddress, txType });
      } catch (error: any) {
        expect(CheckoutApi.isHttpError(error)).toBe(true);
        expect((error as AxiosError).code).toEqual(HttpStatusCode.BadRequest);
        expect((error as AxiosError).message).toEqual('error');
      }
    });

    it('fails 500', async () => {
      const mockResponse = {
        status: HttpStatusCode.InternalServerError,
        statusText: 'error',
        data: {},
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const txType = TransactionType.BRIDGE;
      const fromAddress = '0x1234567890';
      const client = new CheckoutApi({ env: Environment.SANDBOX });
      try {
        await client.getTransactions({ fromAddress, txType });
      } catch (error: any) {
        expect(CheckoutApi.isHttpError(error)).toBe(true);
        expect((error as AxiosError).code).toEqual(HttpStatusCode.InternalServerError);
        expect((error as AxiosError).message).toEqual('error');
      }
    });

    it('throws', async () => {
      mockedAxios.get.mockRejectedValueOnce('error');

      const txType = TransactionType.BRIDGE;
      const fromAddress = '0x1234567890';
      const client = new CheckoutApi({ env: Environment.SANDBOX });
      try {
        await client.getTransactions({ fromAddress, txType });
      } catch (error: any) {
        expect(CheckoutApi.isHttpError(error)).toBe(true);
        expect((error as AxiosError).code).toEqual(HttpStatusCode.InternalServerError);
        expect((error as AxiosError).message).toEqual('InternalServerError');
      }
    });
  });
});
