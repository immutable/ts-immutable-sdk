/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { Wallet } from 'ethers';
import { orderbook } from '@imtbl/sdk';
import { signAndSubmitTx, signMessage } from './sign-and-submit';

// Sign and submit all transaction actions. Collect and return all signatures from signable actions.
export async function actionAll(
  actions: orderbook.Action[],
  wallet: Wallet,
): Promise<string[]> {
  const signatures: string[] = [];
  for (const action of actions) {
    if (action.type === orderbook.ActionType.TRANSACTION) {
      await signAndSubmitTx(
        await (action.buildTransaction()),
        wallet,
      );
    }
    if (action.type === orderbook.ActionType.SIGNABLE) {
      const signature = await signMessage(
        action.message,
        wallet,
      );

      signatures.push(signature);
    }
  }

  return signatures;
}
