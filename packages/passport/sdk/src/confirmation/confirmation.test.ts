/**
 * @jest-environment jsdom
 */
import { TransactionApprovalRequestChainTypeEnum } from '@imtbl/guardian';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import ConfirmationScreen from './confirmation';
import SpyInstance = jest.SpyInstance;
import { testConfig } from '../test/mocks';
import { PassportConfiguration } from '../config';
import { PASSPORT_EVENT_TYPE, ReceiveMessage } from './types';

let windowSpy: SpyInstance;
const closeMock = jest.fn();
const postMessageMock = jest.fn();
const mockNewWindow = {
  closed: true, focus: jest.fn(), close: closeMock, location: { href: 'http' }, postMessage: postMessageMock,
};
const mockedOpen = jest.fn().mockReturnValue(mockNewWindow);
const addEventListenerMock = jest.fn();
const removeEventListenerMock = jest.fn();
const mockEtherAddress = '0x1234';

describe('confirmation', () => {
  beforeEach(() => {
    windowSpy = jest.spyOn(window, 'window', 'get');
    windowSpy.mockImplementation(() => ({
      open: mockedOpen,
      screen: {
        availWidth: 123,
      },
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    }));
  });

  afterEach(() => {
    windowSpy.mockRestore();
  });

  const confirmationScreen = new ConfirmationScreen(testConfig);

  describe('loading', () => {
    it('will loading the confirmation screen', () => {
      confirmationScreen.loading();
      expect(mockedOpen).toHaveBeenCalledTimes(1);
    });

    describe('crossSdkBridgeEnabled', () => {
      it('does not open the confirmation popup if the cross sdk bridge flag is enabled', () => {
        const config = new PassportConfiguration({
          baseConfig: new ImmutableConfiguration({
            environment: Environment.SANDBOX,
          }),
          clientId: 'client123',
          logoutRedirectUri: 'http://localhost:3000/logout',
          redirectUri: 'http://localhost:3000/callback',
          crossSdkBridgeEnabled: true,
        });
        const confirmation = new ConfirmationScreen(config);

        confirmation.loading();
        expect(mockedOpen).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('closeWindow', () => {
    it('should close the window', () => {
      confirmationScreen.loading();
      confirmationScreen.closeWindow();
      expect(closeMock).toBeCalledTimes(1);
    });
  });

  describe('requestConfirmation', () => {
    it('should handle popup window opened', async () => {
      const transactionId = 'transactionId123';
      confirmationScreen.loading();
      const res = await confirmationScreen.requestConfirmation(
        transactionId,
        mockEtherAddress,
        TransactionApprovalRequestChainTypeEnum.Starkex,
      );

      expect(res.confirmed).toEqual(false);
      expect(postMessageMock).toHaveBeenCalledWith(
        {
          eventType: 'imx_passport_confirmation',
          messageType: 'confirmation_data_ready',
          messageData: {
            path: 'transaction',
            query: {
              chainType: 'starkex',
              etherAddress: mockEtherAddress,
              transactionId,
            },
          },
        },
        'https://passport.sandbox.immutable.com',
      );
    });

    it('should send `confirmation_start` postMessage', async () => {
      const transactionId = 'transactionId123';
      const mockedWindowReadyValue = {
        origin: testConfig.passportDomain,
        data: {
          eventType: PASSPORT_EVENT_TYPE,
          messageType: ReceiveMessage.CONFIRMATION_WINDOW_READY,
        },
      };
      addEventListenerMock
        .mockImplementationOnce((event, callback) => {
          callback(mockedWindowReadyValue);
        });
      confirmationScreen.loading();

      await confirmationScreen.requestConfirmation(
        transactionId,
        mockEtherAddress,
        TransactionApprovalRequestChainTypeEnum.Starkex,
      );

      expect(postMessageMock).toHaveBeenCalledTimes(2);
      expect(postMessageMock).toHaveBeenCalledWith(
        {
          eventType: 'imx_passport_confirmation',
          messageType: 'confirmation_data_ready',
          messageData: {
            path: 'transaction',
            query: {
              chainType: 'starkex',
              etherAddress: mockEtherAddress,
              transactionId,
            },
          },
        },
        'https://passport.sandbox.immutable.com',
      );
      expect(postMessageMock).toHaveBeenCalledWith(
        {
          eventType: 'imx_passport_confirmation',
          messageType: 'confirmation_start',
        },
        'https://passport.sandbox.immutable.com',
      );
    });
  });

  describe('requestMessageConfirmation', () => {
    it('should open a window when confirmation is required', async () => {
      const messageId = 'transactionId123';
      const etherAddress = 'etherAddress123';
      confirmationScreen.loading();
      const res = await confirmationScreen.requestMessageConfirmation(messageId, etherAddress);
      expect(res.confirmed).toEqual(false);
      expect(postMessageMock).toHaveBeenCalledTimes(1);
      expect(postMessageMock).toHaveBeenCalledWith(
        {
          eventType: 'imx_passport_confirmation',
          messageType: 'confirmation_data_ready',
          messageData: {
            path: 'zkevm/message',
            query: {
              etherAddress,
              messageID: messageId,
            },
          },
        },
        'https://passport.sandbox.immutable.com',
      );
    });

    it('should send `confirmation_start` postMessage', async () => {
      const messageId = 'transactionId123';
      const etherAddress = 'etherAddress123';
      const mockedWindowReadyValue = {
        origin: testConfig.passportDomain,
        data: {
          eventType: PASSPORT_EVENT_TYPE,
          messageType: ReceiveMessage.CONFIRMATION_WINDOW_READY,
        },
      };
      addEventListenerMock
        .mockImplementationOnce((event, callback) => {
          callback(mockedWindowReadyValue);
        });
      confirmationScreen.loading();

      await confirmationScreen.requestMessageConfirmation(messageId, etherAddress);

      expect(postMessageMock).toHaveBeenCalledTimes(2);
      expect(postMessageMock).toHaveBeenCalledWith(
        {
          eventType: 'imx_passport_confirmation',
          messageType: 'confirmation_start',
        },
        'https://passport.sandbox.immutable.com',
      );
    });
  });
});
