/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { providers, Wallet } from 'ethers';
import { Action, ActionType } from 'types';
import { signAndSubmitTx, signMessage } from './sign-and-submit';

// Sign and submit all transaction actions. Collect and return all signatures from signable actions.
export async function actionAll(
  actions: Action[],
  wallet: Wallet,
  provider: providers.Provider,
): Promise<string[]> {
  const signatures: string[] = [];
  for (const action of actions) {
    if (action.type === ActionType.TRANSACTION) {
      await signAndSubmitTx(
        await (action.buildTransaction()),
        wallet,
        provider,
      );
    }
    if (action.type === ActionType.SIGNABLE) {
      const signature = await signMessage(
        action.message,
        wallet,
      );

      signatures.push(signature);
    }
  }

  return signatures;
}
