/**
 * @jest-environment jsdom
 */
import ConfirmationScreen from './confirmation';
import { Transaction, TransactionTypes } from './types';
import { Config } from '../config';
import SpyInstance = jest.SpyInstance;

let windowSpy: SpyInstance;
const mockNewWindow = { closed: true, focus: jest.fn() };
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
      removeEventListener: removeEventListenerMock
    }));
  });

  afterEach(() => {
    windowSpy.mockRestore();
  });

  describe('startTransaction', () => {
    it('should handle popup window closed', async () => {
      const transaction: Transaction = {
        transactionType: TransactionTypes.Transfer,
        transactionData: {
          type: 'ERC721',
          tokenId: '194442292',
          receiver: '0x0000000000000000000000000000000000000000',
          tokenAddress: '0xacb3c6a43d15b907e8433077b6d38ae40936fe2c',
        },
      };
      const config = {
        network: Config.SANDBOX.network,
        oidcConfiguration: {
          authenticationDomain: Config.SANDBOX.authenticationDomain,
          clientId: "",
          logoutRedirectUri: "",
          redirectUri: "",
        },
        imxAPIConfiguration: {
          basePath: 'https://api.sandbox.x.immutable.com',
        },
        passportDomain: 'https://passport.sandbox.immutable.com',
        magicPublishableApiKey: Config.SANDBOX.magicPublishableApiKey,
        magicProviderId: Config.SANDBOX.magicProviderId,
      };

      const confirmationScreen = new ConfirmationScreen(config);
      const res = await confirmationScreen.startTransaction(
        'ehyyy',
        transaction
      )

      expect(res.confirmed).toEqual(false);
      expect(mockedOpen).toHaveBeenCalledTimes(1);
    });
  });
});

