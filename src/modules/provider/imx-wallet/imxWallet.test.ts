import { ethers } from 'ethers';

import { REQUEST_EVENTS, RESPONSE_EVENTS } from './events';
import { connect, disconnect } from './imxWallet';
import { postRequestMessage } from './postRequestMessage';
import { ENVIRONMENTS } from '../constants';

jest.mock('./postRequestMessage');

describe('imxWallet', () => {
  const env = ENVIRONMENTS.DEVELOPMENT;
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

  describe('connect', () => {
    it('Should call the postMessage', async () => {
      const postRequestMessageMockFn = postRequestMessage as jest.Mock;

      connect(l1Provider, env);

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
        .mockImplementationOnce((_event, callback) => {
          callback(mockedSuccessReturnValue);
        });

      const l2Signer = await connect(l1Provider, env);
      const l2Address = l2Signer.getAddress();

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
        .mockImplementationOnce((_event, callback) => {
          callback(mockedFailedReturnValue);
        });

      expect(connect(l1Provider, env)).rejects.toThrow(
        'The L2 IMX Wallet connection has failed.'
      );
    });
  });

  describe('disconnection', () => {
    it('Should call the postMessage', async () => {
      const postRequestMessageMockFn = postRequestMessage as jest.Mock;

      const l2Signer = await connect(l1Provider, env);

      disconnect(l2Signer);

      await new Promise(process.nextTick);

      expect(postRequestMessageMockFn).toBeCalledWith({
        type: REQUEST_EVENTS.DISCONNECT_WALLET_REQUEST,
        details: { address },
      });
    });
  });
});
