import { Environment } from "@imtbl/config";
import { CheckoutConfigurtionError } from "./config"
import { Checkout } from "../Checkout";
import { CheckoutModuleConfiguration, ProductionChainIdNetworkMap, SandboxChainIdNetworkMap } from "../types";

describe('CheckoutConfiguration class', () => {

  it('should set the environment in the constructor to SANDBOX or PRODUCTION', () => {
      const envs = [Environment.SANDBOX, Environment.PRODUCTION];
      envs.forEach(env => {
        const testCheckoutConfig = {
          baseConfig: {environment: env}
        } as CheckoutModuleConfiguration;
    
        const checkout = new Checkout(testCheckoutConfig);
        expect(checkout).toBeInstanceOf(Checkout);
        expect(checkout.config.environment).toBe(env)
      })
  })

  it('should correctly set the networkMap based on the environment', () => {
      const productionConfig = {
        baseConfig: { environment: Environment.PRODUCTION }
      } as CheckoutModuleConfiguration;
  
      const checkoutProd = new Checkout(productionConfig);
      expect(checkoutProd).toBeInstanceOf(Checkout);
      expect(checkoutProd.config.networkMap).toBe(ProductionChainIdNetworkMap)

      const sandboxConfig = {
        baseConfig: { environment: Environment.SANDBOX }
      } as CheckoutModuleConfiguration;
  
      const checkoutSandbox = new Checkout(sandboxConfig);
      expect(checkoutSandbox).toBeInstanceOf(Checkout);
      expect(checkoutSandbox.config.networkMap).toBe(SandboxChainIdNetworkMap)
  })

  it('should throw an error when environment is misconfigured', () => {
    const testCheckoutConfig = {
      baseConfig: { environment: "prod" as Environment}
    } as CheckoutModuleConfiguration;

    expect(() => new Checkout(testCheckoutConfig)).toThrow(CheckoutConfigurtionError);
    expect(() => new Checkout(testCheckoutConfig)).toThrowError("Invalid checkout configuration of environment");
  })
})