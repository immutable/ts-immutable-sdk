import axios from 'axios';
import AuthManager from './authManager';
import MagicAdapter from './magicAdapter';
import { Passport, PassportConfig } from './Passport';
import { PassportError, PassportErrorType } from './errors/passportError';
import { getStarkSigner } from './stark/getStarkSigner';

jest.mock('./authManager');
jest.mock('./magicAdapter');
jest.mock('./stark/getStarkSigner');
jest.mock('axios');

const config = {clientId: '11111', redirectUri: 'http://test.com'};
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Passport', () => {
    afterEach(jest.resetAllMocks);

    let passport: Passport;
    let authLoginMock: jest.Mock;
    let loginCallbackMock: jest.Mock;
    let magicLoginMock: jest.Mock;
    let refreshToken: jest.Mock;

    beforeEach(() => {
        authLoginMock = jest.fn().mockReturnValue({
            id_token: '123',
        });
        loginCallbackMock = jest.fn();
        magicLoginMock = jest.fn();
        refreshToken = jest.fn();
        (AuthManager as jest.Mock).mockReturnValue({
            login: authLoginMock,
            loginCallback: loginCallbackMock,
            refreshToken: refreshToken,
        });
        (MagicAdapter as jest.Mock).mockReturnValue({
            login: magicLoginMock,
        });
        mockedAxios.get.mockResolvedValue({
            data: {
                passport: {
                    ether_key: '0x232',
                    stark_key: '0x567',
                    user_admin_key: '0x123',
                }
            }
        })
        passport = new Passport(config);
    });

    describe('new Passport', () => {
        it('should throw passport error if missing the required configuration', () => {
            expect(() => new Passport({} as unknown as PassportConfig)).toThrowError(
                new PassportError(
                    'clientId, redirectUri cannot be null',
                    PassportErrorType.INVALID_CONFIGURATION
                )
            );
        });
    });

    describe('connectImx', () => {
        it('should execute connect without error', async () => {
            magicLoginMock.mockResolvedValue({getSigner: jest.fn()});
            refreshToken.mockResolvedValue({})
            await passport.connectImx();

            expect(authLoginMock).toBeCalledTimes(1);
            expect(magicLoginMock).toBeCalledTimes(1);
            expect(getStarkSigner).toBeCalledTimes(1);
        }, 15000);

        it('should execute connect with refresh error', async () => {
            magicLoginMock.mockResolvedValue({getSigner: jest.fn()});
            refreshToken.mockRejectedValue("");

            await expect(passport.connectImx())
                .rejects
                .toThrow('REFRESH_TOKEN_ERROR');

            expect(authLoginMock).toBeCalledTimes(1);
            expect(magicLoginMock).toBeCalledTimes(1);
            expect(getStarkSigner).toBeCalledTimes(1);
        });
    });

    describe('loginCallback', () => {
        it('should execute login callback', async () => {
            await passport.loginCallback();

            expect(loginCallbackMock).toBeCalledTimes(1);
        });
    });
});
