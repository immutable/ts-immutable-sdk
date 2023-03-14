import PassportImxProvider, { JWT } from './passportImxProvider';
import { EthSigner, StarkSigner } from '@imtbl/core-sdk';
import { Config } from '../config';
import registerPassport from '../workflows/registration';

jest.mock('../workflows/registration');

describe('PassportImxProvider', () => {
  let passportImxProvider: PassportImxProvider;

  const passportConfig = {
    network: Config.SANDBOX.network,
    oidcConfiguration: {
      authenticationDomain: Config.SANDBOX.authenticationDomain,
      clientId: "",
      logoutRedirectUri: "",
      redirectUri: "",
    },
    imxAPIConfiguration: {
      basePath: "https://api.sandbox.x.immutable.com",
    },
    magicPublishableApiKey: Config.SANDBOX.magicPublishableApiKey,
    magicProviderId: Config.SANDBOX.magicProviderId,

  };

  beforeEach(() => {
    passportImxProvider = new PassportImxProvider(
      {} as JWT,
      {} as StarkSigner,
      {} as EthSigner,
      passportConfig,
    );
  });

  describe('transfer', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.transfer).toThrowError();
    });
  });

  describe('registerOffchain', () => {
    it('should not throw error', async () => {
      const resp = await passportImxProvider.registerOffchain();

      expect(resp.tx_hash).toEqual("");
      expect(registerPassport).toHaveBeenCalledTimes(1);
    });
  });

  describe('isRegisteredOnchain', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.isRegisteredOnchain).toThrowError();
    });
  });

  describe('createOrder', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.createOrder).toThrowError();
    });
  });

  describe('cancelOrder', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.cancelOrder).toThrowError();
    });
  });

  describe('createTrade', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.createTrade).toThrowError();
    });
  });

  describe('batchNftTransfer', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.batchNftTransfer).toThrowError();
    });
  });

  describe('exchangeTransfer', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.exchangeTransfer).toThrowError();
    });
  });

  describe('deposit', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.deposit).toThrowError();
    });
  });

  describe('prepareWithdrawal', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.prepareWithdrawal).toThrowError();
    });
  });

  describe('completeWithdrawal', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.completeWithdrawal).toThrowError();
    });
  });
});
