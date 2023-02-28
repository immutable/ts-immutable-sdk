import { ethers } from 'ethers';

import { REQUEST_EVENTS, RESPONSE_EVENTS } from './events';
import { connect, getConnection, disconnect } from './imxWallet';
import { postRequestMessage } from './postRequestMessage';

jest.mock('../../utils/logs');
jest.mock('./postRequestMessage');

describe('imxWallet', () => {
  describe('connect', () => {
    const signature = 'The signature';
    const address = '0x1234';
    let l1Provider: ethers.providers.Web3Provider;

    beforeEach(() => {
      l1Provider = {
        getSigner: jest.fn().mockReturnValue({
          getAddress: jest.fn().mockResolvedValue(address),
          signMessage: jest.fn().mockResolvedValue(signature),
        }),
      } as unknown as ethers.providers.Web3Provider;
    });

    afterEach(() => jest.clearAllMocks());

    it('Should call the postMessage', async () => {
      const postRequestMessageMockFn = (postRequestMessage as jest.Mock);

      connect(l1Provider);

      await new Promise(process.nextTick);

      expect(postRequestMessageMockFn).toBeCalledWith({
        type: REQUEST_EVENTS.CONNECT_WALLET_REQUEST,
        details: { ethAddress: address, signature },
      });
    });

    it('Should receive starkPublicKey if l2Wallet returns correct data', async () => {
      const starkPublicKey = '0x4321z';
      const mockedSuccessReturnValue = {
        data: {
          type: RESPONSE_EVENTS.CONNECT_WALLET_RESPONSE,
          details: {
            success: true,
            data: { starkPublicKey },
          },
        },
      };
      window.addEventListener = jest
        .fn()
        .mockImplementationOnce((event, callback) => {
          callback(mockedSuccessReturnValue);
        });

      const l2Signer = await connect(l1Provider);

      const l2Address = await l2Signer.getAddress();

      expect(l2Address).toEqual(starkPublicKey);
    });

    it('Should throws an error if l2Wallet returns error', async () => {
      const mockedFailedReturnValue = {
        data: {
          type: RESPONSE_EVENTS.CONNECT_WALLET_RESPONSE,
          details: {
            success: false,
          },
        },
      };
      window.addEventListener = jest
        .fn()
        .mockImplementationOnce((event, callback) => {
          callback(mockedFailedReturnValue);
        });

      expect(connect(l1Provider)).rejects.toThrow('The L2 IMX Wallet connection has failed.');
    });
  });

  describe('getConnection', () => {
    const etherAddress = '0x1234';

    afterEach(() => jest.clearAllMocks());

    it('Should call the postMessage', async () => {
      const postRequestMessageMockFn = (postRequestMessage as jest.Mock);

      getConnection(etherAddress);

      await new Promise(process.nextTick);

      expect(postRequestMessageMockFn).toBeCalledWith({
        type: REQUEST_EVENTS.GET_CONNECTION_REQUEST,
        details: { etherAddress },
      });
    });

    it('Should receive starkPublicKey if l2Wallet returns correct data', async () => {
      const starkPublicKey = '0x4321z';
      const mockedSuccessReturnValue = {
        data: {
          type: RESPONSE_EVENTS.GET_CONNECTION_RESPONSE,
          details: {
            success: true,
            data: { starkPublicKey },
          },
        },
      };
      window.addEventListener = jest
        .fn()
        .mockImplementationOnce((event, callback) => {
          callback(mockedSuccessReturnValue);
        });

      const l2Signer = await getConnection(etherAddress);

      const l2Address = l2Signer?.getAddress() ?? null;

      expect(l2Address).toEqual(starkPublicKey);
    });

    it('Should return null if l2Wallet returns error', async () => {
      const mockedFailedReturnValue = {
        data: {
          type: RESPONSE_EVENTS.GET_CONNECTION_RESPONSE,
          details: {
            success: false,
          },
        },
      };
      window.addEventListener = jest
        .fn()
        .mockImplementationOnce((event, callback) => {
          callback(mockedFailedReturnValue);
        });

      const result = await getConnection(etherAddress);
      expect(result).toBeUndefined();
    });
  });

  describe('disconnection', () => {
    const starkPublicKey = '0x1234';

    afterEach(() => jest.clearAllMocks());

    it('Should call the postMessage', async () => {
      const postRequestMessageMockFn = (postRequestMessage as jest.Mock);

      disconnect(starkPublicKey);

      await new Promise(process.nextTick);

      expect(postRequestMessageMockFn).toBeCalledWith({
        type: REQUEST_EVENTS.DISCONNECT_WALLET_REQUEST,
        details: { starkPublicKey },
      });
    });
  });
});
