import { Auth } from './Auth';
import { AuthEvents, User } from './types';
import { withMetricsAsync } from './utils/metrics';
import { decodeJwtPayload } from './utils/jwt';

const trackFlowMock = jest.fn();
const trackErrorMock = jest.fn();
const identifyMock = jest.fn();
const trackMock = jest.fn();
const getDetailMock = jest.fn();

jest.mock('@imtbl/metrics', () => ({
  Detail: { RUNTIME_ID: 'runtime-id' },
  trackFlow: (...args: any[]) => trackFlowMock(...args),
  trackError: (...args: any[]) => trackErrorMock(...args),
  identify: (...args: any[]) => identifyMock(...args),
  track: (...args: any[]) => trackMock(...args),
  getDetail: (...args: any[]) => getDetailMock(...args),
}));

jest.mock('./utils/jwt', () => ({
  decodeJwtPayload: jest.fn(),
}));

beforeEach(() => {
  trackFlowMock.mockReset();
  trackErrorMock.mockReset();
  identifyMock.mockReset();
  trackMock.mockReset();
  getDetailMock.mockReset();
  (decodeJwtPayload as jest.Mock).mockReset();
});

describe('withMetricsAsync', () => {
  it('resolves with function result and tracks flow', async () => {
    const flow = {
      addEvent: jest.fn(),
      details: { flowId: 'flow-id' },
    };
    trackFlowMock.mockReturnValue(flow);

    const result = await withMetricsAsync(async () => 'done', 'login');

    expect(result).toEqual('done');
    expect(trackFlowMock).toHaveBeenCalledWith('passport', 'login', true);
    expect(flow.addEvent).toHaveBeenCalledWith('End');
  });

  it('tracks error when function throws', async () => {
    const flow = {
      addEvent: jest.fn(),
      details: { flowId: 'flow-id' },
    };
    trackFlowMock.mockReturnValue(flow);
    const error = new Error('boom');

    await expect(withMetricsAsync(async () => {
      throw error;
    }, 'login')).rejects.toThrow(error);

    expect(trackErrorMock).toHaveBeenCalledWith('passport', 'login', error, { flowId: 'flow-id' });
    expect(flow.addEvent).toHaveBeenCalledWith('End');
  });

  it('does not fail when non-error is thrown', async () => {
    const flow = {
      addEvent: jest.fn(),
      details: { flowId: 'flow-id' },
    };
    trackFlowMock.mockReturnValue(flow);

    const nonError = { message: 'failure' };
    await expect(withMetricsAsync(async () => {
      throw nonError as unknown as Error;
    }, 'login')).rejects.toBe(nonError);

    expect(flow.addEvent).toHaveBeenCalledWith('errored');
  });
});

describe('Auth', () => {
  describe('getUserOrLogin', () => {
    const createMockUser = (): User => ({
      accessToken: 'access',
      idToken: 'id',
      refreshToken: 'refresh',
      expired: false,
      profile: {
        sub: 'user-123',
        email: 'test@example.com',
        nickname: 'tester',
      },
    });

    it('emits LOGGED_IN event and identifies user when login is required', async () => {
      const auth = Object.create(Auth.prototype) as Auth;
      const loginWithPopup = jest.fn().mockResolvedValue(createMockUser());

      (auth as any).eventEmitter = { emit: jest.fn() };
      (auth as any).getUserInternal = jest.fn().mockResolvedValue(null);
      (auth as any).loginWithPopup = loginWithPopup;

      const user = await auth.getUserOrLogin();

      expect(loginWithPopup).toHaveBeenCalledTimes(1);
      expect((auth as any).eventEmitter.emit).toHaveBeenCalledWith(AuthEvents.LOGGED_IN, user);
      expect(identifyMock).toHaveBeenCalledWith({ passportId: user.profile.sub });
    });

    it('returns cached user without triggering login', async () => {
      const auth = Object.create(Auth.prototype) as Auth;
      const cachedUser = createMockUser();

      (auth as any).eventEmitter = { emit: jest.fn() };
      (auth as any).getUserInternal = jest.fn().mockResolvedValue(cachedUser);
      (auth as any).loginWithPopup = jest.fn();

      const user = await auth.getUserOrLogin();

      expect(user).toBe(cachedUser);
      expect((auth as any).loginWithPopup).not.toHaveBeenCalled();
      expect((auth as any).eventEmitter.emit).not.toHaveBeenCalled();
      expect(identifyMock).not.toHaveBeenCalled();
    });
  });

  describe('buildExtraQueryParams', () => {
    it('omits third_party_a_id when no anonymous id is provided', () => {
      const auth = Object.create(Auth.prototype) as Auth;
      (auth as any).userManager = { settings: { extraQueryParams: {} } };
      getDetailMock.mockReturnValue('runtime-id-value');

      const params = (auth as any).buildExtraQueryParams();

      expect(params.third_party_a_id).toBeUndefined();
      expect(params.rid).toEqual('runtime-id-value');
    });
  });

  describe('username extraction', () => {
    it('extracts username from id token when present', () => {
      const mockOidcUser = {
        id_token: 'token',
        access_token: 'access',
        refresh_token: 'refresh',
        expired: false,
        profile: { sub: 'user-123', email: 'test@example.com', nickname: 'tester' },
      };

      (decodeJwtPayload as jest.Mock).mockReturnValue({
        username: 'username123',
        passport: undefined,
      });

      const result = (Auth as any).mapOidcUserToDomainModel(mockOidcUser);

      expect(decodeJwtPayload).toHaveBeenCalledWith('token');
      expect(result.profile.username).toEqual('username123');
    });

    it('maps username when creating OIDC user from device tokens', () => {
      const tokenResponse = {
        id_token: 'token',
        access_token: 'access',
        refresh_token: 'refresh',
        token_type: 'Bearer',
        expires_in: 3600,
      };

      (decodeJwtPayload as jest.Mock).mockReturnValue({
        sub: 'user-123',
        iss: 'issuer',
        aud: 'audience',
        exp: 1,
        iat: 0,
        email: 'test@example.com',
        nickname: 'tester',
        username: 'username123',
        passport: undefined,
      });

      const oidcUser = (Auth as any).mapDeviceTokenResponseToOidcUser(tokenResponse);

      expect(decodeJwtPayload).toHaveBeenCalledWith('token');
      expect(oidcUser.profile.username).toEqual('username123');
    });
  });

  describe('refreshTokenAndUpdatePromise', () => {
    it('emits TOKEN_REFRESHED event when signinSilent succeeds', async () => {
      const mockOidcUser = {
        id_token: 'new-id',
        access_token: 'new-access',
        refresh_token: 'new-refresh',
        expired: false,
        profile: { sub: 'user-123', email: 'test@example.com', nickname: 'tester' },
      };

      (decodeJwtPayload as jest.Mock).mockReturnValue({
        username: undefined,
        passport: undefined,
      });

      const auth = Object.create(Auth.prototype) as Auth;
      const mockEventEmitter = { emit: jest.fn() };
      const mockUserManager = {
        signinSilent: jest.fn().mockResolvedValue(mockOidcUser),
      };

      (auth as any).eventEmitter = mockEventEmitter;
      (auth as any).userManager = mockUserManager;
      (auth as any).refreshingPromise = null;

      const user = await (auth as any).refreshTokenAndUpdatePromise();

      expect(user).toBeDefined();
      expect(user.accessToken).toBe('new-access');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        AuthEvents.TOKEN_REFRESHED,
        expect.objectContaining({
          accessToken: 'new-access',
          refreshToken: 'new-refresh',
        }),
      );
    });

    it('does not emit TOKEN_REFRESHED event when signinSilent returns null', async () => {
      const auth = Object.create(Auth.prototype) as Auth;
      const mockEventEmitter = { emit: jest.fn() };
      const mockUserManager = {
        signinSilent: jest.fn().mockResolvedValue(null),
      };

      (auth as any).eventEmitter = mockEventEmitter;
      (auth as any).userManager = mockUserManager;
      (auth as any).refreshingPromise = null;

      const user = await (auth as any).refreshTokenAndUpdatePromise();

      expect(user).toBeNull();
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('emits USER_REMOVED event ONLY for invalid_grant error (refresh token invalid)', async () => {
      const auth = Object.create(Auth.prototype) as Auth;
      const mockEventEmitter = { emit: jest.fn() };
      const mockUserManager = {
        signinSilent: jest.fn().mockRejectedValue(
          Object.assign(new Error('invalid_grant'), {
            error: 'invalid_grant',
            error_description: 'Unknown or invalid refresh token',
          }),
        ),
        removeUser: jest.fn().mockResolvedValue(undefined),
      };

      // Make the error an instance of ErrorResponse
      const { ErrorResponse } = jest.requireActual('oidc-client-ts');
      const errorResponse = new ErrorResponse({
        error: 'invalid_grant',
        error_description: 'Unknown or invalid refresh token',
      });
      mockUserManager.signinSilent.mockRejectedValue(errorResponse);

      (auth as any).eventEmitter = mockEventEmitter;
      (auth as any).userManager = mockUserManager;
      (auth as any).refreshingPromise = null;

      await expect((auth as any).refreshTokenAndUpdatePromise()).rejects.toThrow();

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        AuthEvents.USER_REMOVED,
        expect.objectContaining({
          reason: 'refresh_token_invalid',
        }),
      );
      expect(mockUserManager.removeUser).toHaveBeenCalled();
    });

    it('does not emit USER_REMOVED event for network errors (transient)', async () => {
      const auth = Object.create(Auth.prototype) as Auth;
      const mockEventEmitter = { emit: jest.fn() };
      const mockUserManager = {
        signinSilent: jest.fn().mockRejectedValue(new Error('Network error: Failed to fetch')),
        removeUser: jest.fn().mockResolvedValue(undefined),
      };

      (auth as any).eventEmitter = mockEventEmitter;
      (auth as any).userManager = mockUserManager;
      (auth as any).refreshingPromise = null;

      await expect((auth as any).refreshTokenAndUpdatePromise()).rejects.toThrow();

      // Network errors are transient - should NOT remove user or emit USER_REMOVED
      expect(mockEventEmitter.emit).not.toHaveBeenCalledWith(
        AuthEvents.USER_REMOVED,
        expect.anything(),
      );
      expect(mockUserManager.removeUser).not.toHaveBeenCalled();
    });

    it('does not emit USER_REMOVED event for non-invalid_grant OAuth errors', async () => {
      const auth = Object.create(Auth.prototype) as Auth;
      const mockEventEmitter = { emit: jest.fn() };
      const mockUserManager = {
        signinSilent: jest.fn(),
        removeUser: jest.fn().mockResolvedValue(undefined),
      };

      // Mock ErrorResponse with a different error (not invalid_grant)
      const { ErrorResponse } = jest.requireActual('oidc-client-ts');
      const errorResponse = new ErrorResponse({
        error: 'server_error',
        error_description: 'Internal server error',
      });
      mockUserManager.signinSilent.mockRejectedValue(errorResponse);

      (auth as any).eventEmitter = mockEventEmitter;
      (auth as any).userManager = mockUserManager;
      (auth as any).refreshingPromise = null;

      await expect((auth as any).refreshTokenAndUpdatePromise()).rejects.toThrow();

      // Non-invalid_grant errors might be transient - should NOT remove user
      expect(mockEventEmitter.emit).not.toHaveBeenCalledWith(
        AuthEvents.USER_REMOVED,
        expect.anything(),
      );
      expect(mockUserManager.removeUser).not.toHaveBeenCalled();
    });

    it('does not emit USER_REMOVED event for ErrorTimeout', async () => {
      const auth = Object.create(Auth.prototype) as Auth;
      const mockEventEmitter = { emit: jest.fn() };
      const mockUserManager = {
        signinSilent: jest.fn(),
        removeUser: jest.fn().mockResolvedValue(undefined),
      };

      // Mock ErrorTimeout
      const { ErrorTimeout } = jest.requireActual('oidc-client-ts');
      const timeoutError = new ErrorTimeout('Silent sign-in timed out');
      mockUserManager.signinSilent.mockRejectedValue(timeoutError);

      (auth as any).eventEmitter = mockEventEmitter;
      (auth as any).userManager = mockUserManager;
      (auth as any).refreshingPromise = null;

      await expect((auth as any).refreshTokenAndUpdatePromise()).rejects.toThrow();

      expect(mockEventEmitter.emit).not.toHaveBeenCalledWith(
        AuthEvents.USER_REMOVED,
        expect.anything(),
      );
      expect(mockUserManager.removeUser).not.toHaveBeenCalled();
    });
  });

  describe('loginWithPopup', () => {
    let mockUserManager: any;
    let originalCryptoRandomUUID: any;

    beforeEach(() => {
      // Mock crypto.randomUUID
      originalCryptoRandomUUID = window.crypto.randomUUID;
      window.crypto.randomUUID = jest.fn().mockReturnValue('test-popup-id');

      // Mock UserManager
      mockUserManager = {
        signinPopup: jest.fn(),
        settings: {
          extraQueryParams: {},
        },
      };
    });

    afterEach(() => {
      window.crypto.randomUUID = originalCryptoRandomUUID;
    });

    it('successfully completes authentication and returns user', async () => {
      const mockOidcUser = {
        id_token: 'token',
        access_token: 'access',
        refresh_token: 'refresh',
        expired: false,
        profile: { sub: 'user-123', email: 'test@example.com', nickname: 'tester' },
      };

      (decodeJwtPayload as jest.Mock).mockReturnValue({
        username: 'username123',
        passport: undefined,
      });

      mockUserManager.signinPopup.mockResolvedValue(mockOidcUser);

      const auth = Object.create(Auth.prototype) as Auth;
      (auth as any).userManager = mockUserManager;
      (auth as any).config = {
        popupOverlayOptions: { disableHeadlessLoginPromptOverlay: true },
      };
      getDetailMock.mockReturnValue('runtime-id-value');

      const user = await (auth as any).loginWithPopup({
        directLoginMethod: 'google',
        marketingConsentStatus: 'opted_in',
      });

      expect(user).toBeDefined();
      expect(user.profile.sub).toBe('user-123');
      expect(user.profile.email).toBe('test@example.com');
    });

    it('calls signinPopup with correct configuration', async () => {
      const mockOidcUser = {
        id_token: 'token',
        access_token: 'access',
        refresh_token: 'refresh',
        expired: false,
        profile: { sub: 'user-123', email: 'test@example.com', nickname: 'tester' },
      };

      (decodeJwtPayload as jest.Mock).mockReturnValue({
        username: 'username123',
        passport: undefined,
      });

      mockUserManager.signinPopup.mockResolvedValue(mockOidcUser);

      const auth = Object.create(Auth.prototype) as Auth;
      (auth as any).userManager = mockUserManager;
      (auth as any).config = {
        popupOverlayOptions: { disableHeadlessLoginPromptOverlay: true },
      };
      getDetailMock.mockReturnValue('runtime-id-value');

      await (auth as any).loginWithPopup({
        directLoginMethod: 'google',
        marketingConsentStatus: 'opted_in',
      });

      expect(mockUserManager.signinPopup).toHaveBeenCalledWith(
        expect.objectContaining({
          popupWindowTarget: 'test-popup-id',
          popupWindowFeatures: { width: 410, height: 450 },
          popupAbortOnClose: true,
          extraQueryParams: expect.any(Object),
        }),
      );
    });

    it('rejects when signinPopup rejects', async () => {
      const error = new Error('Authentication failed');
      mockUserManager.signinPopup.mockRejectedValue(error);

      const auth = Object.create(Auth.prototype) as Auth;
      (auth as any).userManager = mockUserManager;
      (auth as any).config = {
        popupOverlayOptions: { disableHeadlessLoginPromptOverlay: true },
      };
      getDetailMock.mockReturnValue('runtime-id-value');

      await expect((auth as any).loginWithPopup({
        directLoginMethod: 'google',
        marketingConsentStatus: 'opted_in',
      })).rejects.toThrow('Authentication failed');
    });
  });
});
