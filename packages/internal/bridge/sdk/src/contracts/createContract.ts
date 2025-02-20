import { Contract, Provider } from 'ethers';
import { BridgeErrorType, withBridgeError } from '../errors';

export async function createContract(address: string, iface: any, provider: Provider) {
  return await withBridgeError<Contract>(
    async () => new Contract(address, iface, provider),
    BridgeErrorType.PROVIDER_ERROR,
    // TODO what kind of error should this be? Should we just make a new "CONTRACT_CREATION_ERROR"?
  );
}
