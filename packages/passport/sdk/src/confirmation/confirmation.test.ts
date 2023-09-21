/**
 * @jest-environment jsdom
 */
import { TransactionApprovalRequestChainTypeEnum } from '@imtbl/guardian';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import ConfirmationScreen from './confirmation';
import SpyInstance = jest.SpyInstance;
import { testConfig } from '../test/mocks';
import { PassportConfiguration } from '../config';

let windowSpy: SpyInstance;
const closeMock = jest.fn();
const mockNewWindow = {
  closed: true, focus: jest.fn(), close: closeMock, location: { href: 'http' },
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
      const res = await confirmationScreen.requestConfirmation(
        transactionId,
        mockEtherAddress,
        TransactionApprovalRequestChainTypeEnum.Starkex,
      );
      confirmationScreen.loading();

      expect(res.confirmed).toEqual(false);
      expect(mockNewWindow.location.href).toEqual('https://passport.sandbox.immutable.com/transaction-confirmation/transaction?transactionId=transactionId123&imxEtherAddress=0x1234&chainType=starkex');
    });
  });

  describe('requestMessageConfirmation', () => {
    it('should open a window when confirmation is required', async () => {
      const res = await confirmationScreen.requestMessageConfirmation('asd123');
      confirmationScreen.loading();
      expect(res.confirmed).toEqual(false);
      expect(mockNewWindow.location.href).toEqual('https://passport.sandbox.immutable.com/transaction-confirmation/zkevm/message?messageID=asd123');
    });
  });
});
