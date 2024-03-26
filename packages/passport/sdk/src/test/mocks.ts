import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { User, UserImx, UserZkEvm } from '../types';
import { PassportConfiguration } from '../config';
import { ChainId } from '../network/chains';

export const mockErrorMessage = 'Server is down';
export const mockStarkSignature = 'starkSignature';

export const chainId = ChainId.IMTBL_ZKEVM_TESTNET;
export const chainIdHex = '0x34a1';
export const chainIdEip155 = `eip155:${chainId}`;

const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2V4YW1wbGUuYXV0aDAuY29tLyIsImF1ZCI6Imh0dHBzOi8vYXBpLmV4YW1wbGUuY29tL2NhbGFuZGFyL3YxLyIsInN1YiI6InVzcl8xMjMiLCJpYXQiOjE0NTg3ODU3OTYsImV4cCI6MTQ1ODg3MjE5Nn0.CA7eaHjIHz5NxeIJoFK9krqaeZrPLwmMmgI_XiQiIkQ';

export const testConfig = new PassportConfiguration({
  baseConfig: new ImmutableConfiguration({
    environment: Environment.SANDBOX,
  }),
  clientId: 'client123',
  logoutRedirectUri: 'http://localhost:3000/logout',
  redirectUri: 'http://localhost:3000/callback',
});

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
    ethAddress: '0x0000000000000000000000000000000000000001',
    userAdminAddress: '0x0000000000000000000000000000000000000002',
  },
};

export const mockLinkedAddresses = {
  data: {
    linked_addresses: [
      '0x123',
      '0x456',
    ],
  },
};

export const mockListChains = {
  data: {
    result: [
      {
        id: 'eip155:13473',
        name: 'Immutable zkEVM Test',
        rpc_url: 'https://rpc.testnet.immutable.com',
      },
    ],
  },
};
