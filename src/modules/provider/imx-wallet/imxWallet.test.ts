/*
 * @jest-environment jsdom
 */

import { ethers } from 'ethers';

import { RequestEventType, ResponseEventType } from './events';
import { connect, disconnect } from './imxWallet';
import { postRequestMessage } from './postRequestMessage';
import { Environment } from '../constants';
import { asyncTriggerIFrameOnLoad } from './testUtils';
import { getOrSetupIFrame } from './imxWalletIFrame';
import { ImxSigner } from './ImxSigner';

jest.mock('./postRequestMessage');

describe('imxWallet', () => {
  const env = Environment.DEVELOPMENT;
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
      const iframe = await asyncTriggerIFrameOnLoad(getOrSetupIFrame(env));
      const postRequestMessageMockFn = postRequestMessage as jest.Mock;

      connect(l1Provider, env);

      await new Promise(process.nextTick);

      expect(postRequestMessageMockFn).toBeCalledWith(iframe, {
        type: RequestEventType.CONNECT_WALLET_REQUEST,
        details: { ethAddress: address, signature },
      });
    });

    it('Should receive starkPublicKey if l2Wallet returns correct data', async () => {
      const iframe = await asyncTriggerIFrameOnLoad(getOrSetupIFrame(env));

      const starkPublicKey = '0x4321z';
      const mockedSuccessReturnValue = {
        data: {
          type: ResponseEventType.CONNECT_WALLET_RESPONSE,
          details: {
            success: true,
            data: { starkPublicKey },
          },
        },
        source: iframe.contentWindow,
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
          type: ResponseEventType.CONNECT_WALLET_RESPONSE,
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
      const iframe = await asyncTriggerIFrameOnLoad(getOrSetupIFrame(env));
      const postRequestMessageMockFn = postRequestMessage as jest.Mock;
      const starkPublicKey = '0x123';

      const l2Signer = new ImxSigner(starkPublicKey, iframe);

      disconnect(l2Signer);

      await new Promise(process.nextTick);

      expect(postRequestMessageMockFn).toBeCalledWith(iframe, {
        type: RequestEventType.DISCONNECT_WALLET_REQUEST,
        details: { starkPublicKey },
      });
    });
  });
});
