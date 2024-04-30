import { ethers } from 'ethers';
import { BridgeConfiguration } from '../config';
import { BridgeError, BridgeErrorType, withBridgeError } from '../errors';

export async function validateChainConfiguration(config: BridgeConfiguration): Promise<void> {
  const errMessage = 'Please upgrade to the latest version of the Bridge SDK or provide valid configuration';
  const rootNetwork = await withBridgeError<ethers.providers.Network>(
    async () => config.rootProvider.getNetwork(),
    BridgeErrorType.ROOT_PROVIDER_ERROR,
  );

  // Checks chain ID matches
  if (rootNetwork!.chainId.toString() !== config.bridgeInstance.rootChainID) {
    throw new BridgeError(
      `Rootchain provider chainID ${rootNetwork!.chainId} does not match expected chainID ${config.bridgeInstance.rootChainID}. ${errMessage}`,
      BridgeErrorType.UNSUPPORTED_ERROR,
    );
  }

  const childNetwork = await withBridgeError<ethers.providers.Network>(
    async () => config.childProvider.getNetwork(),
    BridgeErrorType.CHILD_PROVIDER_ERROR,
  );

  if (childNetwork.chainId.toString() !== config.bridgeInstance.childChainID) {
    throw new BridgeError(
      `Childchain provider chainID ${childNetwork.chainId} does not match expected chainID ${config.bridgeInstance.childChainID}. ${errMessage} `,
      BridgeErrorType.UNSUPPORTED_ERROR,
    );
  }
}
