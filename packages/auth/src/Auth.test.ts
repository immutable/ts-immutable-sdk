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

    it('emits USER_REMOVED event for invalid_grant error', async () => {
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

      // Definitive rejection: no retry, user removed immediately
      expect(mockUserManager.signinSilent).toHaveBeenCalledTimes(1);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        AuthEvents.USER_REMOVED,
        expect.objectContaining({
          reason: 'refresh_failed',
        }),
      );
      expect(mockUserManager.removeUser).toHaveBeenCalled();
    });

    it('emits USER_REMOVED event for login_required error', async () => {
      const auth = Object.create(Auth.prototype) as Auth;
      const mockEventEmitter = { emit: jest.fn() };
      const mockUserManager = {
        signinSilent: jest.fn(),
        removeUser: jest.fn().mockResolvedValue(undefined),
      };

      const { ErrorResponse } = jest.requireActual('oidc-client-ts');
      const errorResponse = new ErrorResponse({
        error: 'login_required',
        error_description: 'User must re-authenticate',
      });
      mockUserManager.signinSilent.mockRejectedValue(errorResponse);

      (auth as any).eventEmitter = mockEventEmitter;
      (auth as any).userManager = mockUserManager;
      (auth as any).refreshingPromise = null;

      await expect((auth as any).refreshTokenAndUpdatePromise()).rejects.toThrow();

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        AuthEvents.USER_REMOVED,
        expect.objectContaining({
          reason: 'refresh_failed',
        }),
      );
      expect(mockUserManager.removeUser).toHaveBeenCalled();
    });

    it('retries network errors and keeps the user when retries are exhausted', async () => {
      jest.useFakeTimers();
      try {
        const auth = Object.create(Auth.prototype) as Auth;
        const mockEventEmitter = { emit: jest.fn() };
        const mockUserManager = {
          signinSilent: jest.fn().mockRejectedValue(new Error('Network error: Failed to fetch')),
          removeUser: jest.fn().mockResolvedValue(undefined),
        };

        (auth as any).eventEmitter = mockEventEmitter;
        (auth as any).userManager = mockUserManager;
        (auth as any).refreshingPromise = null;

        const assertion = expect((auth as any).refreshTokenAndUpdatePromise()).rejects.toThrow();
        await jest.advanceTimersByTimeAsync(6000); // both backoffs, generous for jitter
        await assertion;

        // Initial attempt + 2 retries, and the still-valid refresh token is kept
        expect(mockUserManager.signinSilent).toHaveBeenCalledTimes(3);
        expect(mockEventEmitter.emit).not.toHaveBeenCalled();
        expect(mockUserManager.removeUser).not.toHaveBeenCalled();
      } finally {
        jest.useRealTimers();
      }
    });

    it('recovers when a transient failure is followed by success', async () => {
      jest.useFakeTimers();
      try {
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
          signinSilent: jest.fn()
            .mockRejectedValueOnce(new Error('Network error: Failed to fetch'))
            .mockResolvedValue(mockOidcUser),
          removeUser: jest.fn().mockResolvedValue(undefined),
        };

        (auth as any).eventEmitter = mockEventEmitter;
        (auth as any).userManager = mockUserManager;
        (auth as any).refreshingPromise = null;

        const refreshPromise = (auth as any).refreshTokenAndUpdatePromise();
        await jest.advanceTimersByTimeAsync(2000); // backoff before the retry
        const user = await refreshPromise;

        expect(user.accessToken).toBe('new-access');
        expect(mockUserManager.signinSilent).toHaveBeenCalledTimes(2);
        expect(mockEventEmitter.emit).toHaveBeenCalledWith(
          AuthEvents.TOKEN_REFRESHED,
          expect.objectContaining({ accessToken: 'new-access' }),
        );
        expect(mockUserManager.removeUser).not.toHaveBeenCalled();
      } finally {
        jest.useRealTimers();
      }
    });

    it('retries server_error OAuth errors and keeps the user', async () => {
      jest.useFakeTimers();
      try {
        const auth = Object.create(Auth.prototype) as Auth;
        const mockEventEmitter = { emit: jest.fn() };
        const mockUserManager = {
          signinSilent: jest.fn(),
          removeUser: jest.fn().mockResolvedValue(undefined),
        };

        const { ErrorResponse } = jest.requireActual('oidc-client-ts');
        const errorResponse = new ErrorResponse({
          error: 'server_error',
          error_description: 'Internal server error',
        });
        mockUserManager.signinSilent.mockRejectedValue(errorResponse);

        (auth as any).eventEmitter = mockEventEmitter;
        (auth as any).userManager = mockUserManager;
        (auth as any).refreshingPromise = null;

        const assertion = expect((auth as any).refreshTokenAndUpdatePromise()).rejects.toThrow();
        await jest.advanceTimersByTimeAsync(6000);
        await assertion;

        expect(mockUserManager.signinSilent).toHaveBeenCalledTimes(3);
        expect(mockEventEmitter.emit).not.toHaveBeenCalled();
        expect(mockUserManager.removeUser).not.toHaveBeenCalled();
      } finally {
        jest.useRealTimers();
      }
    });

    it('retries too_many_requests OAuth errors (rate limit) and keeps the user', async () => {
      jest.useFakeTimers();
      try {
        const auth = Object.create(Auth.prototype) as Auth;
        const mockEventEmitter = { emit: jest.fn() };
        const mockUserManager = {
          signinSilent: jest.fn(),
          removeUser: jest.fn().mockResolvedValue(undefined),
        };

        // oidc-client-ts surfaces any non-OK response with an `error` body field as
        // an ErrorResponse, including 429s — these must not destroy the session
        const { ErrorResponse } = jest.requireActual('oidc-client-ts');
        const errorResponse = new ErrorResponse({
          error: 'too_many_requests',
          error_description: 'Rate limit exceeded',
        });
        mockUserManager.signinSilent.mockRejectedValue(errorResponse);

        (auth as any).eventEmitter = mockEventEmitter;
        (auth as any).userManager = mockUserManager;
        (auth as any).refreshingPromise = null;

        const assertion = expect((auth as any).refreshTokenAndUpdatePromise()).rejects.toThrow();
        await jest.advanceTimersByTimeAsync(6000);
        await assertion;

        expect(mockUserManager.signinSilent).toHaveBeenCalledTimes(3);
        expect(mockEventEmitter.emit).not.toHaveBeenCalled();
        expect(mockUserManager.removeUser).not.toHaveBeenCalled();
      } finally {
        jest.useRealTimers();
      }
    });

    it('retries unknown errors and keeps the user', async () => {
      jest.useFakeTimers();
      try {
        const auth = Object.create(Auth.prototype) as Auth;
        const mockEventEmitter = { emit: jest.fn() };
        const mockUserManager = {
          signinSilent: jest.fn().mockRejectedValue(new Error('Some unknown error')),
          removeUser: jest.fn().mockResolvedValue(undefined),
        };

        (auth as any).eventEmitter = mockEventEmitter;
        (auth as any).userManager = mockUserManager;
        (auth as any).refreshingPromise = null;

        const assertion = expect((auth as any).refreshTokenAndUpdatePromise()).rejects.toThrow();
        await jest.advanceTimersByTimeAsync(6000);
        await assertion;

        // Unknown errors are treated as transient: the refresh token may still be
        // valid, so the user is kept and the next call can try again
        expect(mockUserManager.signinSilent).toHaveBeenCalledTimes(3);
        expect(mockEventEmitter.emit).not.toHaveBeenCalled();
        expect(mockUserManager.removeUser).not.toHaveBeenCalled();
      } finally {
        jest.useRealTimers();
      }
    });

    it('does not emit USER_REMOVED event for ErrorTimeout', async () => {
      jest.useFakeTimers();
      try {
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

        const assertion = expect((auth as any).refreshTokenAndUpdatePromise()).rejects.toThrow();
        await jest.advanceTimersByTimeAsync(6000); // timeouts are retried before rejecting
        await assertion;

        expect(mockEventEmitter.emit).not.toHaveBeenCalledWith(
          AuthEvents.USER_REMOVED,
          expect.anything(),
        );
        expect(mockUserManager.removeUser).not.toHaveBeenCalled();
      } finally {
        jest.useRealTimers();
      }
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
