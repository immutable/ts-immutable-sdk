import EmbeddedLoginPrompt from './embeddedLoginPrompt';
import EmbeddedLoginPromptOverlay from '../overlay/embeddedLoginPromptOverlay';
import { PassportConfiguration } from '../config';
import {
  EMBEDDED_LOGIN_PROMPT_EVENT_TYPE,
  EmbeddedLoginPromptReceiveMessage,
  EmbeddedLoginPromptResult,
} from './types';
import { DirectLoginOptions, MarketingConsentStatus } from '../types';

// Mock dependencies
jest.mock('../overlay/embeddedLoginPromptOverlay');
jest.mock('../config');

describe('EmbeddedLoginPrompt', () => {
  let embeddedLoginPrompt: EmbeddedLoginPrompt;
  let mockConfig: jest.Mocked<PassportConfiguration>;
  let mockOverlay: jest.Mocked<typeof EmbeddedLoginPromptOverlay>;

  const mockClientId = 'test-client-id';

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Mock DOM methods
    document.createElement = jest.fn().mockImplementation((tagName: string) => {
      if (tagName === 'iframe') {
        return { id: '', src: '', style: {} };
      }
      return { id: '', textContent: '' }; // For style elements
    });
    document.getElementById = jest.fn();
    document.head.appendChild = jest.fn();

    // Mock config
    mockConfig = {
      oidcConfiguration: {
        clientId: mockClientId,
      },
      authenticationDomain: 'https://auth.immutable.com',
    } as jest.Mocked<PassportConfiguration>;

    // Mock overlay
    mockOverlay = EmbeddedLoginPromptOverlay as jest.Mocked<typeof EmbeddedLoginPromptOverlay>;
    mockOverlay.appendOverlay = jest.fn();
    mockOverlay.remove = jest.fn();

    embeddedLoginPrompt = new EmbeddedLoginPrompt(mockConfig);
  });

  afterEach(() => {
    // Clean up event listeners
    window.removeEventListener = jest.fn();
  });

  describe('constructor', () => {
    it('should initialize with provided config', () => {
      expect(embeddedLoginPrompt).toBeInstanceOf(EmbeddedLoginPrompt);
    });
  });

  describe('getHref', () => {
    it('should generate correct href with client ID', () => {
      const href = (embeddedLoginPrompt as any).getHref();
      expect(href).toBe(`https://auth.immutable.com/im-embedded-login-prompt?client_id=${mockClientId}`);
    });
  });

  describe('appendIFrameStylesIfNeeded', () => {
    it('should not append styles if they already exist', () => {
      const mockElement = { id: 'passport-embedded-login-keyframes' };
      (document.getElementById as jest.Mock).mockReturnValue(mockElement);

      // Clear the mock call count from beforeEach
      jest.clearAllMocks();
      (document.getElementById as jest.Mock).mockReturnValue(mockElement);

      (EmbeddedLoginPrompt as any).appendIFrameStylesIfNeeded();

      expect(document.createElement).not.toHaveBeenCalled();
      expect(document.head.appendChild).not.toHaveBeenCalled();
    });

    it('should append styles if they do not exist', () => {
      const mockStyleElement = {
        id: '',
        textContent: '',
      };

      (document.getElementById as jest.Mock).mockReturnValue(null);
      (document.createElement as jest.Mock).mockReturnValue(mockStyleElement);

      (EmbeddedLoginPrompt as any).appendIFrameStylesIfNeeded();

      expect(document.createElement).toHaveBeenCalledWith('style');
      expect(mockStyleElement.id).toBe('passport-embedded-login-keyframes');
    });
  });

  describe('getEmbeddedLoginIFrame', () => {
    it('should create iframe with correct properties', () => {
      const mockIframe = {
        id: '',
        src: '',
        style: {},
      };

      // Mock createElement to return different elements based on tag name
      (document.createElement as jest.Mock).mockImplementation((tagName: string) => {
        if (tagName === 'iframe') {
          return mockIframe;
        }
        return { id: '', textContent: '' }; // For style elements
      });
      (document.getElementById as jest.Mock).mockReturnValue(null);

      const iframe = (embeddedLoginPrompt as any).getEmbeddedLoginIFrame();

      expect(document.createElement).toHaveBeenCalledWith('iframe');
      expect(iframe.id).toBe('passport-embedded-login-iframe');
    });
  });

  describe('displayEmbeddedLoginPrompt', () => {
    let mockIframe: any;
    let mockAddEventListener: jest.Mock;
    let mockRemoveEventListener: jest.Mock;

    beforeEach(() => {
      mockIframe = {
        id: 'passport-embedded-login-iframe',
        src: '',
        style: {},
      };

      mockAddEventListener = jest.fn();
      mockRemoveEventListener = jest.fn();

      (document.createElement as jest.Mock).mockImplementation((tagName: string) => {
        if (tagName === 'iframe') {
          return mockIframe;
        }
        return { id: '', textContent: '' }; // For style elements
      });
      (document.getElementById as jest.Mock).mockReturnValue(null);

      Object.defineProperty(window, 'addEventListener', {
        value: mockAddEventListener,
        writable: true,
      });
      Object.defineProperty(window, 'removeEventListener', {
        value: mockRemoveEventListener,
        writable: true,
      });
    });

    it('should resolve with email login options when email method is selected', async () => {
      const mockLoginResult: EmbeddedLoginPromptResult = {
        loginType: 'email',
        emailAddress: 'test@example.com',
        marketingConsent: MarketingConsentStatus.OptedIn,
      };

      const promise = embeddedLoginPrompt.displayEmbeddedLoginPrompt();

      // Simulate message event
      const messageHandler = mockAddEventListener.mock.calls[0][1];
      const mockEvent = {
        data: {
          eventType: EMBEDDED_LOGIN_PROMPT_EVENT_TYPE,
          messageType: EmbeddedLoginPromptReceiveMessage.LOGIN_METHOD_SELECTED,
          loginMethod: mockLoginResult,
        },
        origin: mockConfig.authenticationDomain,
      };

      messageHandler(mockEvent);

      const result = await promise;
      const expectedResult: DirectLoginOptions = {
        directLoginMethod: 'email',
        marketingConsentStatus: MarketingConsentStatus.OptedIn,
        email: 'test@example.com',
      };

      expect(result).toEqual(expectedResult);
      expect(mockRemoveEventListener).toHaveBeenCalledWith('message', messageHandler);
      expect(mockOverlay.remove).toHaveBeenCalled();
    });

    it('should resolve with non-email login options when non-email method is selected', async () => {
      const mockLoginResult: EmbeddedLoginPromptResult = {
        loginType: 'google',
        marketingConsent: MarketingConsentStatus.Unsubscribed,
      };

      const promise = embeddedLoginPrompt.displayEmbeddedLoginPrompt();

      // Simulate message event
      const messageHandler = mockAddEventListener.mock.calls[0][1];
      const mockEvent = {
        data: {
          eventType: EMBEDDED_LOGIN_PROMPT_EVENT_TYPE,
          messageType: EmbeddedLoginPromptReceiveMessage.LOGIN_METHOD_SELECTED,
          loginMethod: mockLoginResult,
        },
        origin: mockConfig.authenticationDomain,
      };

      messageHandler(mockEvent);

      const result = await promise;
      const expectedResult: DirectLoginOptions = {
        directLoginMethod: 'google',
        marketingConsentStatus: MarketingConsentStatus.Unsubscribed,
      };

      expect(result).toEqual(expectedResult);
      expect(mockRemoveEventListener).toHaveBeenCalledWith('message', messageHandler);
      expect(mockOverlay.remove).toHaveBeenCalled();
    });

    it('should reject with error when login prompt error occurs', async () => {
      const promise = embeddedLoginPrompt.displayEmbeddedLoginPrompt();

      // Simulate error message event
      const messageHandler = mockAddEventListener.mock.calls[0][1];
      const mockEvent = {
        data: {
          eventType: EMBEDDED_LOGIN_PROMPT_EVENT_TYPE,
          messageType: EmbeddedLoginPromptReceiveMessage.LOGIN_PROMPT_ERROR,
        },
        origin: mockConfig.authenticationDomain,
      };

      messageHandler(mockEvent);

      await expect(promise).rejects.toThrow('Error during embedded login prompt');
      expect(mockRemoveEventListener).toHaveBeenCalledWith('message', messageHandler);
      expect(mockOverlay.remove).toHaveBeenCalled();
    });

    it('should reject with error when login prompt is closed', async () => {
      const promise = embeddedLoginPrompt.displayEmbeddedLoginPrompt();

      // Simulate close message event
      const messageHandler = mockAddEventListener.mock.calls[0][1];
      const mockEvent = {
        data: {
          eventType: EMBEDDED_LOGIN_PROMPT_EVENT_TYPE,
          messageType: EmbeddedLoginPromptReceiveMessage.LOGIN_PROMPT_CLOSED,
        },
        origin: mockConfig.authenticationDomain,
      };

      messageHandler(mockEvent);

      await expect(promise).rejects.toThrow('Popup closed by user');
      expect(mockRemoveEventListener).toHaveBeenCalledWith('message', messageHandler);
      expect(mockOverlay.remove).toHaveBeenCalled();
    });

    it('should reject with error for unsupported message type', async () => {
      const promise = embeddedLoginPrompt.displayEmbeddedLoginPrompt();

      // Simulate unsupported message event
      const messageHandler = mockAddEventListener.mock.calls[0][1];
      const mockEvent = {
        data: {
          eventType: EMBEDDED_LOGIN_PROMPT_EVENT_TYPE,
          messageType: 'UNKNOWN_MESSAGE_TYPE',
        },
        origin: mockConfig.authenticationDomain,
      };

      messageHandler(mockEvent);

      await expect(promise).rejects.toThrow('Unsupported message type');
      expect(mockRemoveEventListener).toHaveBeenCalledWith('message', messageHandler);
      expect(mockOverlay.remove).toHaveBeenCalled();
    });

    it('should ignore messages from wrong origin', async () => {
      embeddedLoginPrompt.displayEmbeddedLoginPrompt();

      // Simulate message from wrong origin
      const messageHandler = mockAddEventListener.mock.calls[0][1];
      const mockEvent = {
        data: {
          eventType: EMBEDDED_LOGIN_PROMPT_EVENT_TYPE,
          messageType: EmbeddedLoginPromptReceiveMessage.LOGIN_METHOD_SELECTED,
          loginMethod: { loginType: 'google', marketingConsent: MarketingConsentStatus.OptedIn },
        },
        origin: 'https://malicious-site.com',
      };

      messageHandler(mockEvent);

      // Should not resolve or reject yet
      expect(mockRemoveEventListener).not.toHaveBeenCalled();
      expect(mockOverlay.remove).not.toHaveBeenCalled();
    });

    it('should ignore messages with wrong event type', async () => {
      embeddedLoginPrompt.displayEmbeddedLoginPrompt();

      // Simulate message with wrong event type
      const messageHandler = mockAddEventListener.mock.calls[0][1];
      const mockEvent = {
        data: {
          eventType: 'WRONG_EVENT_TYPE',
          messageType: EmbeddedLoginPromptReceiveMessage.LOGIN_METHOD_SELECTED,
          loginMethod: { loginType: 'google', marketingConsent: MarketingConsentStatus.OptedIn },
        },
        origin: mockConfig.authenticationDomain,
      };

      messageHandler(mockEvent);

      // Should not resolve or reject yet
      expect(mockRemoveEventListener).not.toHaveBeenCalled();
      expect(mockOverlay.remove).not.toHaveBeenCalled();
    });

    it('should setup overlay with close callback', async () => {
      const promise = embeddedLoginPrompt.displayEmbeddedLoginPrompt();

      expect(mockOverlay.appendOverlay).toHaveBeenCalledWith(
        mockIframe,
        expect.any(Function),
      );

      // Test the close callback
      const closeCallback = mockOverlay.appendOverlay.mock.calls[0][1];
      closeCallback();

      await expect(promise).rejects.toThrow('Popup closed by user');
      expect(mockRemoveEventListener).toHaveBeenCalled();
      expect(mockOverlay.remove).toHaveBeenCalled();
    });

    it('should add message event listener', () => {
      embeddedLoginPrompt.displayEmbeddedLoginPrompt();

      expect(mockAddEventListener).toHaveBeenCalledWith('message', expect.any(Function));
    });
  });
});
