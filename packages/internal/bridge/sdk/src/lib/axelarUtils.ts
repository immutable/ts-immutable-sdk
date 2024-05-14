import { Provider } from '@ethersproject/providers';
import { Address } from 'types';
import { WITHDRAW_SIG, NATIVE } from 'constants/bridges';
import { CHILD_ERC20 } from 'contracts/ABIs/ChildERC20';
import { withBridgeError, BridgeErrorType } from 'errors';
import { ethers } from 'ethers';
import { keccak256, defaultAbiCoder } from 'ethers/lib/utils';
import { isWrappedIMX, getRootIMX } from './utils';

/**
 * We need the Axelar command ID to be unique, otherwise the simulation could fail.
 * We don't necessarily care if the command is what would actually be used by the
 * Axelar network.
 * @param payload The Axelar GMP payload.
 * @returns hash of payload and current time.
 */
export function genUniqueAxelarCommandId(payload: string) {
  return keccak256(
    defaultAbiCoder.encode(['bytes', 'uint256'], [payload, new Date().getTime()]),
  );
}

/**
 * Generates an Axelar GMP payload for a withdrawal.
 * Note that this is not the payload *hash*. It can be any length of bytes.
 */
export function genAxelarWithdrawPayload(
  rootToken: string,
  sender: string,
  recipient: string,
  amount: string,
) {
  return defaultAbiCoder.encode(
    ['bytes32', 'address', 'address', 'address', 'uint256'],
    [WITHDRAW_SIG, rootToken, sender, recipient, amount],
  );
}

export async function createChildErc20Contract(
  token: string,
  childProvider: Provider,
): Promise<ethers.Contract> {
  return withBridgeError<ethers.Contract>(
    async () => new ethers.Contract(token, CHILD_ERC20, childProvider),
    BridgeErrorType.PROVIDER_ERROR,
  );
}

/**
 * Given a child chain token address (or NATIVE), returns its corresponding root token address.
 * This is done by calling the `rootToken` function on the child token contract.
 */
export async function getWithdrawRootToken(
  childToken: string,
  destinationChainId: string,
  childProvider: ethers.providers.Provider,
): Promise<string> {
  if (childToken.toUpperCase() === NATIVE
    || isWrappedIMX(childToken, destinationChainId)) {
    return getRootIMX(destinationChainId);
  }
  // Find root token
  const erc20Contract: ethers.Contract = await createChildErc20Contract(childToken, childProvider);

  return withBridgeError<Address>(() => erc20Contract.rootToken(), BridgeErrorType.PROVIDER_ERROR);
}
