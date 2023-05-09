import { Environment } from "@imtbl/config";
import { CheckoutConfig, CheckoutConfigurtionError } from "./config"
import { Checkout } from "../Checkout";
import { ProductionChainIdNetworkMap, SandboxChainIdNetworkMap } from "../types";

describe('CheckoutConfiguration class', () => {

  it('should set the environment in the constructor to SANDBOX or PRODUCTION', () => {
      const envs = [Environment.SANDBOX, Environment.PRODUCTION];
      envs.forEach(env => {
        const testCheckoutConfig = {
          environment: env
        } as CheckoutConfig;
    
        const checkout = new Checkout(testCheckoutConfig);
        expect(checkout).toBeInstanceOf(Checkout);
        expect(checkout.config.environment).toBe(env)
      })
  })

  it('should correctly set the networkMap based on the environment', () => {
      const productionConfig = {
        environment: Environment.PRODUCTION
      } as CheckoutConfig;
  
      const checkoutProd = new Checkout(productionConfig);
      expect(checkoutProd).toBeInstanceOf(Checkout);
      expect(checkoutProd.config.networkMap).toBe(ProductionChainIdNetworkMap)

      const sandboxConfig = {
        environment: Environment.SANDBOX
      } as CheckoutConfig;
  
      const checkoutSandbox = new Checkout(sandboxConfig);
      expect(checkoutSandbox).toBeInstanceOf(Checkout);
      expect(checkoutSandbox.config.networkMap).toBe(SandboxChainIdNetworkMap)
  })

  it('should throw an error when environment is misconfigured', () => {
    const testCheckoutConfig = {
      environment: "prod"
    } as unknown as CheckoutConfig;

    expect(() => new Checkout(testCheckoutConfig)).toThrow(CheckoutConfigurtionError);
    expect(() => new Checkout(testCheckoutConfig)).toThrowError("Invalid checkout configuration of environment");
  })
})