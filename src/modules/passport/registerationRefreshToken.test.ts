import axios from 'axios';
import AuthManager from './authManager';
import { requestRefreshToken } from './registerationRefreshToken';

jest.mock('axios');
jest.mock('./authManager');

const mockedAxios = axios as jest.Mocked<typeof axios>;

const passportData = {
    passport: {
        ether_key: '0x232',
        stark_key: '0x567',
        user_admin_key: '0x123',
    }
}

describe('requestRefreshToken', () => {
    afterEach(() => {
        mockedAxios.get.mockClear();
    });
    it('requestRefreshToken successful with user wallet address in metadata', async () => {
        const mockUpdatedUser = {access_token: '123'};
        (AuthManager as jest.Mock).mockReturnValue({
            refreshToken: jest.fn().mockReturnValue(mockUpdatedUser),
        });
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ'
        const response = {
            data: {
                'sub': 'email|63a3c1ada9d926a4845a3f0c',
                'nickname': 'yundi.fu',
                ...passportData,
            }
        };
        const authManager = new AuthManager({clientId: '', redirectUri: ''});
        mockedAxios.get.mockImplementationOnce(() => Promise.resolve(response));

        const res = await requestRefreshToken(authManager, mockToken);

        expect(res).toEqual(mockUpdatedUser)
        expect(authManager.refreshToken).toHaveBeenCalledTimes(1)
        expect(mockedAxios.get).toHaveBeenCalledWith('https://auth.dev.immutable.com/userinfo', {'headers': {'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ'}}
        )
    });

    it('requestRefreshToken failed without user wallet address in metadata with retries', async () => {
        const response = {
            data: {
                'sub': 'email|63a3c1ada9d926a4845a3f0c',
                'nickname': 'yundi.fu',
            }
        };
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ'
        const authManager = new AuthManager({clientId: '', redirectUri: ''});
        mockedAxios.get.mockImplementationOnce(() => Promise.resolve(response));

        await expect(requestRefreshToken(authManager, mockToken))
            .rejects
            .toThrow('REFRESH_TOKEN_ERROR');

        expect(authManager.refreshToken).toHaveBeenCalledTimes(0)

    }, 15000);

    it('requestRefreshToken failed with fetching user info error in metadata with retries', async () => {
        const response = {
            status: 500
        };
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ'
        const authManager = new AuthManager({clientId: '', redirectUri: ''});
        mockedAxios.get.mockImplementationOnce(() => Promise.reject(response));

        await expect(requestRefreshToken(authManager, mockToken))
            .rejects
            .toThrow('REFRESH_TOKEN_ERROR');

        expect(authManager.refreshToken).toHaveBeenCalledTimes(0)
        expect(mockedAxios.get).toHaveBeenCalledTimes(6)

    }, 15000);
});
