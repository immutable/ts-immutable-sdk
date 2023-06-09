import { TransactionRequest } from '@ethersproject/providers';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { Passport } from './Passport';

// jest.mock('magic-sdk', () => {
//
// });

describe.skip('Passport', () => {
  const audience = 'platform_api';
  const clientId = 'clientId123';
  const logoutRedirectUri = 'https://example.com/logout';
  const redirectUri = 'https://example.com/login';
  const scope = 'openid offline_access profile email transact';

  describe('zkEvmProvider', () => {
    it('successfully initialises the zkEvm provider', async () => {
      const passport = new Passport({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        }),
        audience,
        clientId,
        logoutRedirectUri,
        redirectUri,
        scope,
      });
      const zkEvmProvider = passport.connectEvm();

      const accounts = await zkEvmProvider.request({
        id: 1,
        jsonrpc: '2.0',
        method: 'eth_requestAccounts',
      });

      expect(accounts).toEqual(['0x123']);

      const transaction: TransactionRequest = {
        from: '0x123',
        to: '0x401',
        data: '0x0000000099',
      };
      const transactionHash = await zkEvmProvider.request({
        id: 1,
        jsonrpc: '2.0',
        method: 'eth_sendTransaction',
        params: [transaction],
      });

      expect(transactionHash).toEqual('0x745');
    });
  });
});
