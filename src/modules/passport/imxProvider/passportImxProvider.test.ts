import { StarkSigner } from '@imtbl/core-sdk';
import PassportImxProvider, { JWT } from './passportImxProvider';

describe('PassportImxProvider', () => {
  let passportImxProvider: PassportImxProvider;

  beforeEach(() => {
    passportImxProvider = new PassportImxProvider(
      {} as JWT,
      {} as StarkSigner,
    );
  });

  describe('transfer', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.transfer).toThrowError();
    });
  });

  describe('registerOffchain', () => {
    it('should throw error', async () => {
      expect(passportImxProvider.registerOffchain).toThrowError();
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
