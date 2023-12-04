import { Environment } from '@imtbl/config';
import { CheckoutConfigurationError, getL1ChainId, getL2ChainId } from './config';
import { Checkout } from '../sdk';
import {
  ChainId,
  CheckoutModuleConfiguration,
} from '../types';
import { PRODUCTION_CHAIN_ID_NETWORK_MAP, SANDBOX_CHAIN_ID_NETWORK_MAP } from '../env';

describe('config', () => {
  describe('CheckoutConfiguration class', () => {
    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      process.env = { CHECKOUT_DEV_MODE: undefined };
    });
    it('should set the environment in the constructor to SANDBOX or PRODUCTION', () => {
      const envs = [Environment.SANDBOX, Environment.PRODUCTION];
      envs.forEach((env) => {
        const testCheckoutConfig = {
          baseConfig: { environment: env },
        } as CheckoutModuleConfiguration;

        const checkout = new Checkout(testCheckoutConfig);
        expect(checkout).toBeInstanceOf(Checkout);
        expect(checkout.config.environment).toBe(env);
      });
    });

    it('should set is development', () => {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      process.env = { CHECKOUT_DEV_MODE: 'true' };
      const testCheckoutConfig = {
        baseConfig: { environment: Environment.SANDBOX },
      } as CheckoutModuleConfiguration;

      const checkout = new Checkout(testCheckoutConfig);
      expect(checkout.config.isDevelopment).toBeTruthy();
    });

    it('should correctly set the networkMap for sandbox', () => {
      const sandboxConfig = {
        baseConfig: { environment: Environment.SANDBOX },
      } as CheckoutModuleConfiguration;

      const checkoutSandbox = new Checkout(sandboxConfig);
      expect(checkoutSandbox).toBeInstanceOf(Checkout);
      expect(checkoutSandbox.config.networkMap).toBe(
        SANDBOX_CHAIN_ID_NETWORK_MAP,
      );
    });

    it('should correctly set the networkMap for prod', () => {
      const productionConfig = {
        baseConfig: { environment: Environment.PRODUCTION },
      } as CheckoutModuleConfiguration;

      const checkoutProd = new Checkout(productionConfig);
      expect(checkoutProd).toBeInstanceOf(Checkout);
      expect(checkoutProd.config.networkMap).toBe(
        PRODUCTION_CHAIN_ID_NETWORK_MAP,
      );
    });

    it('should throw an error when environment is misconfigured', () => {
      const testCheckoutConfig = {
        baseConfig: { environment: 'prod' as Environment },
      } as CheckoutModuleConfiguration;

      expect(() => new Checkout(testCheckoutConfig)).toThrow(
        CheckoutConfigurationError,
      );
      expect(() => new Checkout(testCheckoutConfig)).toThrowError(
        'Invalid checkout configuration of environment',
      );
    });
  });

  describe('get layer chain id', () => {
    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      process.env = { CHECKOUT_DEV_MODE: undefined };
    });
    it('should get the L1 chain id for environment', () => {
      const envs = [
        {
          env: Environment.SANDBOX,
          chainId: ChainId.SEPOLIA,
        },
        {
          env: Environment.PRODUCTION,
          chainId: ChainId.ETHEREUM,
        },
      ];
      envs.forEach(({ env, chainId }) => {
        const testCheckoutConfig = {
          baseConfig: { environment: env },
        } as CheckoutModuleConfiguration;

        const checkout = new Checkout(testCheckoutConfig);
        expect(getL1ChainId(checkout.config)).toEqual(chainId);
      });
    });

    it('should get the L2 chain id for environment', () => {
      const envs = [
        {
          env: Environment.SANDBOX,
          chainId: ChainId.IMTBL_ZKEVM_TESTNET,
        },
        {
          env: Environment.PRODUCTION,
          chainId: ChainId.IMTBL_ZKEVM_MAINNET,
        },
        {
          env: Environment.SANDBOX,
          chainId: ChainId.IMTBL_ZKEVM_DEVNET,
          overrideDev: true,
        },
      ];
      envs.forEach(({ env, chainId, overrideDev }) => {
        const testCheckoutConfig = {
          baseConfig: { environment: env },
        } as CheckoutModuleConfiguration;

        // eslint-disable-next-line @typescript-eslint/naming-convention
        if (overrideDev) process.env = { CHECKOUT_DEV_MODE: 'true' };

        const checkout = new Checkout(testCheckoutConfig);
        expect(getL2ChainId(checkout.config)).toEqual(chainId);
      });
    });
  });
});
