import { ChainId } from "@imtbl/checkout-sdk";
import { Environment } from "@imtbl/config";

/**
 * Returns the preferred L1 ChainId for the given environment.
 * @param environment 
 * @returns 
 */
export function L1Network(environment: Environment) {
  return environment === Environment.PRODUCTION ? ChainId.ETHEREUM : ChainId.GOERLI;
}

/**
 * Returns the preferred zkEVM ChainId for the given environment.
 * @param environment 
 * @returns 
 */
export function zkEVMNetwork(environment: Environment) {
  return environment === Environment.PRODUCTION ? ChainId.POLYGON : ChainId.POLYGON_ZKEVM_TESTNET;
}
