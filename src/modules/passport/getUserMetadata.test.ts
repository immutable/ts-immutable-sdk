import axios from 'axios';
import { getUserEtherKeyFromMetadata } from './getUserMetadata';

jest.mock('axios');
jest.mock('./authManager');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const passportAuthDomain = 'https://auth.dev.immutable.com';

const passportData = {
  passport: {
    ether_key: '0x232',
    stark_key: '0x567',
    user_admin_key: '0x123',
  }
};

describe('getUserEtherKeyFromMetadata', () => {
  afterEach(() => {
    mockedAxios.get.mockClear();
  });
  it('getUserMetadata successful with user wallet address in metadata', async () => {
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ';
    const response = {
      data: {
        'sub': 'email|63a3c1ada9d926a4845a3f0c',
        'nickname': 'yundi.fu',
        ...passportData,
      }
    };
    mockedAxios.get.mockImplementationOnce(() => Promise.resolve(response));

    const res = await getUserEtherKeyFromMetadata(passportAuthDomain, mockToken);

    expect(res).toEqual(passportData.passport.ether_key);
    expect(mockedAxios.get).toHaveBeenCalledWith('https://auth.dev.immutable.com/userinfo', { 'headers': { 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ' } }
    );
  });

  it('getUserMetadata failed without user wallet address', async () => {
    const response = {
      data: {
        'sub': 'email|63a3c1ada9d926a4845a3f0c',
        'nickname': 'yundi.fu',
      }
    };
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ';
    mockedAxios.get.mockImplementationOnce(() => Promise.resolve(response));

    await expect(getUserEtherKeyFromMetadata(passportAuthDomain, mockToken))
      .rejects.toEqual('user wallet addresses not exist');
  });

  it('requestRefreshToken failed with fetching user info error', async () => {
    const response = {
      status: 500
    };
    const mockToken = 'getUserMetadata.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ';
    mockedAxios.get.mockImplementationOnce(() => Promise.reject(response));

    await expect(getUserEtherKeyFromMetadata(passportAuthDomain, mockToken))
      .rejects
      .toEqual(response);
  });
});
