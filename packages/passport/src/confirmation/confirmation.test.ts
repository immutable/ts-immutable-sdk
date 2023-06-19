/**
 * @jest-environment jsdom
 */
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import ConfirmationScreen from './confirmation';
import { Transaction, TransactionTypes } from './types';
import { PassportConfiguration } from '../config';
import SpyInstance = jest.SpyInstance;

let windowSpy: SpyInstance;
const closeMock = jest.fn();
const mockNewWindow = {
  closed: true, focus: jest.fn(), close: closeMock, location: { href: 'http' },
};
const mockedOpen = jest.fn().mockReturnValue(mockNewWindow);
const addEventListenerMock = jest.fn();
const removeEventListenerMock = jest.fn();

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

  const config = new PassportConfiguration({
    baseConfig: new ImmutableConfiguration({
      environment: Environment.SANDBOX,
    }),
    clientId: 'clientId123',
    logoutRedirectUri: 'http://localhost:3000',
    redirectUri: 'http://localhost:3000',
  });

  const confirmationScreen = new ConfirmationScreen(config);

  describe('loading', () => {
    it('will loading the confirmation screen', () => {
      confirmationScreen.loading();
      expect(mockedOpen).toHaveBeenCalledTimes(1);
    });
  });

  describe('closeWindow', () => {
    it('should close the window', () => {
      confirmationScreen.loading();
      confirmationScreen.closeWindow();
      expect(closeMock).toBeCalledTimes(1);
    });
  });

  describe('startGuardianTransaction', () => {
    it('should handle popup window opened', async () => {
      const transactionId = 'transactionId123';
      const res = await confirmationScreen.startGuardianTransaction(
        transactionId,
      );
      confirmationScreen.loading();

      expect(res.confirmed).toEqual(false);
      expect(mockNewWindow.location.href).toEqual('https://passport.sandbox.immutable.com/transaction-confirmation/transaction.html?transactionId=transactionId123&chainType=starkex');
    });
  });

  describe('startTransaction', () => {
    it('should handle popup window opened', async () => {
      const transaction: Transaction = {
        transactionType: TransactionTypes.createTransfer,
        transactionData: {
          amount: '1',
          token: {
            type: 'ERC721',
            data: {
              token_id: '194442292',
              token_address: '0xacb3c6a43d15b907e8433077b6d38ae40936fe2c',
            },
          },
          sender: '0x0000000000000000000000000000000000000001',
          receiver: '0x0000000000000000000000000000000000000000',
        },
      };
      const res = await confirmationScreen.startTransaction(
        'ehyyy',
        transaction,
      );

      expect(res.confirmed).toEqual(false);
      expect(mockedOpen).toHaveBeenCalledTimes(1);
    });
  });
});
