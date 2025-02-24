import { Contract, getAddress } from 'ethers';
import { NATIVE } from '../constants/bridges';
import { withBridgeError, BridgeErrorType } from '../errors';

/**
 * @param sender Bridge depositer/withdrawer
 * @param recipient Deposit or withdrawal recipient
 * @param amount Amount to deposit or withdraw
 * @param token Token to deposit or withdraw. NATIVE if native asset on the source chain.
 * @param currentBridgeMethods A Record mapping bridge operation names to contract method names
 * @param bridgeContract: The bridge contract to be interacting with dependinig on network and if it's a deposit or withdrawal
 * @returns calldata for the requested bridge transaction (i.e. tx.data)
 */
export async function getBridgeTxCalldata(
  sender: string,
  recipient: string,
  amount: bigint,
  token: string,
  currentBridgeMethods: Record<string, string>,
  bridgeContract: Contract,
) {
  let functionName: string;
  let parameters: any[];
  /**
   * Handle bridge transaction for native token
   */
  if (token.toUpperCase() === NATIVE) {
    if (sender === recipient) {
      // Deposit or withdraw native token
      functionName = currentBridgeMethods.native;
      parameters = [amount];
    } else {
      // Deposit or withdraw native token TO
      functionName = currentBridgeMethods.nativeTo;
      parameters = [recipient, amount];
    }
  } else {
    /**
     * Handle bridge transaction for ERC20
     */
    const erc20Token = getAddress(token);
    if (sender === recipient) {
      // Deposit or withdraw ERC20
      functionName = currentBridgeMethods.token;
      parameters = [erc20Token, amount];
    } else {
      // Deposit or withdraw ERC20 TO.
      functionName = currentBridgeMethods.tokenTo;
      parameters = [erc20Token, recipient, amount];
    }
  }

  return await withBridgeError<string>(async () => bridgeContract.interface.encodeFunctionData(
    functionName,
    parameters,
  ), BridgeErrorType.INTERNAL_ERROR);
}
