import { ethers } from 'ethers';
import { FungibleToken } from 'types';
import { BridgeConfiguration } from '../config';
import { BridgeError, BridgeErrorType, withBridgeError } from '../errors';
import { isChildETH, isRootIMX } from './utils';

// TODO consider moving these to be member methods of the config class

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

// Checks that the recipient address can receive the asset being deposited/withdrawn
// This is relevant because the recipient address may be a contract that implements a receive function
export async function checkReceiver(
  tokenSent: FungibleToken,
  destinationChainId: string,
  address: string,
  config: BridgeConfiguration,
): Promise<void> {
  let provider;
  if (destinationChainId === config.bridgeInstance.rootChainID) {
    if (!isChildETH(tokenSent, destinationChainId)) {
      // Return immediately for withdrawing non ETH (i.e. withdrawing ERC20).
      return;
    }
    provider = config.rootProvider;
  } else {
    if (!isRootIMX(tokenSent, destinationChainId)) {
      // Return immediately for depositing non IMX (i.e. depositing ERC20).
      return;
    }
    provider = config.childProvider;
  }

  const bytecode = await provider.getCode(address);
  // No code : "0x" then the address is not a contract so it is a valid receiver.
  if (bytecode.length <= 2) return;

  const ABI = ['function receive()'];
  const contract = new ethers.Contract(address, ABI, provider);

  try {
    // try to estimate gas for the receive function, if it works it exists
    await contract.estimateGas.receive();
  } catch {
    try {
      // if receive fails, try to estimate this way which will work if a fallback function is present
      await provider.estimateGas({ to: address });
    } catch {
      // no receive or fallback
      throw new BridgeError(
        `address ${address} is not a valid receipient`,
        BridgeErrorType.INVALID_RECIPIENT,
      );
    }
  }
}
