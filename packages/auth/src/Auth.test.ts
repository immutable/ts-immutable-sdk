import { Auth } from './Auth';
import { AuthEvents, User } from './types';
import { withMetricsAsync } from './utils/metrics';

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

beforeEach(() => {
  trackFlowMock.mockReset();
  trackErrorMock.mockReset();
  identifyMock.mockReset();
  trackMock.mockReset();
  getDetailMock.mockReset();
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
});
