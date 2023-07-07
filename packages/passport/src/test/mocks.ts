import { User, UserImx, UserZkEvm } from '../types';

export const mockErrorMessage = 'Server is down';
export const mockStarkSignature = 'starkSignature';

const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2V4YW1wbGUuYXV0aDAuY29tLyIsImF1ZCI6Imh0dHBzOi8vYXBpLmV4YW1wbGUuY29tL2NhbGFuZGFyL3YxLyIsInN1YiI6InVzcl8xMjMiLCJpYXQiOjE0NTg3ODU3OTYsImV4cCI6MTQ1ODg3MjE5Nn0.CA7eaHjIHz5NxeIJoFK9krqaeZrPLwmMmgI_XiQiIkQ';

export const mockUser: User = {
  accessToken,
  idToken: 'id123',
  refreshToken: 'refresh123',
  profile: {
    sub: 'email|123',
    email: 'test@immutable.com',
    nickname: 'test',
  },
  expired: false,
};

export const mockUserImx: UserImx = {
  ...mockUser,
  imx: {
    ethAddress: 'imxEthAddress123',
    starkAddress: 'imxStarkAddress123',
    userAdminAddress: 'imxUserAdminAddress123',
  },
};

export const mockUserZkEvm: UserZkEvm = {
  ...mockUser,
  zkEvm: {
    ethAddress: 'zkevmEthAddress123',
    userAdminAddress: 'zkevmUserAdminAddress123',
  },
};
