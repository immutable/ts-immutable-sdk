import { RequestEventType, ResponseEventType } from './events';
import { ImxSigner } from './ImxSigner';
import { postRequestMessage } from './postRequestMessage';

jest.mock('./postRequestMessage');

describe('ImxSigner', () => {
  const starkAddress = 'Ox1234z';
  const iframe: HTMLIFrameElement = {
    contentWindow: {
      postMessage: jest.fn().mockReturnValue({}),
    },
  } as unknown as HTMLIFrameElement;

  describe('getAddress', () => {
    it('Should return l2Signer address', () => {
      const imxSigner = new ImxSigner(starkAddress, iframe);

      expect(imxSigner.getAddress()).toEqual(starkAddress);
    });
  });

  describe('signMessage', () => {
    const message = 'message';
    const imxSigner = new ImxSigner(starkAddress, iframe);

    it('Should call the postMessage', async () => {
      const postRequestMessageMockFn = postRequestMessage as jest.Mock;

      imxSigner.signMessage(message);

      await new Promise(process.nextTick);

      expect(postRequestMessageMockFn).toBeCalledWith(iframe, {
        type: RequestEventType.SIGN_MESSAGE_REQUEST,
        details: { starkPublicKey: starkAddress, message },
      });
    });

    it('Should receive signed message if l2Wallet signed successfully', async () => {
      const signedMessage = 'signedmessage';
      const mockedSuccessReturnValue = {
        data: {
          type: ResponseEventType.SIGN_MESSAGE_RESPONSE,
          details: {
            success: true,
            data: { signedMessage },
          },
        },
        source: iframe.contentWindow,
      };
      window.addEventListener = jest
        .fn()
        .mockImplementationOnce((event, callback) => {
          callback(mockedSuccessReturnValue);
        });

      const returnSignedMessage = await imxSigner.signMessage(message);

      expect(returnSignedMessage).toEqual(signedMessage);
    });

    it('Should throws an error if l2Wallet returns an error when signing the message', async () => {
      const errorMessage = 'Failed signing message from imxSigner';
      const mockedFailedReturnValue = {
        data: {
          type: ResponseEventType.SIGN_MESSAGE_RESPONSE,
          details: {
            success: false,
            error: {
              code: 500,
              message: errorMessage,
            },
          },
        },
        source: iframe.contentWindow,
      };
      window.addEventListener = jest
        .fn()
        .mockImplementationOnce((event, callback) => {
          callback(mockedFailedReturnValue);
        });

      expect(imxSigner.signMessage(message)).rejects.toThrow(errorMessage);
    });
  });
});
