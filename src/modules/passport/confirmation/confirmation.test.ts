import displayConfirmationScreen from './confirmation';

let windowSpy: any;
const mockNewWindow = { closed: true, focus: jest.fn() };
const mockedOpen = jest.fn().mockReturnValue(mockNewWindow);
const addEventListenerMock = jest.fn();
const removeEventListenerMock = jest.fn();

describe('confirmation', () => {
  beforeEach(() => {
    windowSpy = jest.spyOn(window, "window", "get");
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

  describe('displayConfirmationScreen', () => {
    it('should handle popup window closed', async () => {
      const messageData = {
        transactionType: "v1/transfer",
        transactionData: {
          type: 'ERC721',
          tokenId: '194442292',
          receiver: '0x0000000000000000000000000000000000000000',
          tokenAddress: '0xacb3c6a43d15b907e8433077b6d38ae40936fe2c',
        },
      };

      const res = await displayConfirmationScreen({
        messageType: "transaction_start",
        messageData: messageData as never,
        accessToken: "ehyyy",
        passportDomain: "test.com"
      });
      expect(res.confirmed).toEqual(false)
      expect(mockedOpen).toHaveBeenCalledTimes(1);
    });
  });
});

