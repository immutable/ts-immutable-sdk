import {
  PopulatedTransaction,
  Signer,
  TypedDataDomain,
  providers,
  Wallet,
} from 'ethers';

import { orderbook } from '@imtbl/sdk';

export async function waitForOrderToBeOfStatus(
  sdk: orderbook.Orderbook,
  orderId: string,
  status: orderbook.OrderStatusName,
  attempts = 0,
): Promise<any> {
  if (attempts > 50) {
    throw new Error('Order never became active');
  }

  const { result: order } = await sdk.getListing(orderId);
  if (order.status.name === status) {
    return order;
  }

  // eslint-disable-next-line
  await new Promise(resolve => setTimeout(resolve, 1000));
  return waitForOrderToBeOfStatus(sdk, orderId, status, attempts + 1);
}

export async function signAndSubmitTx(
  transaction: PopulatedTransaction,
  signer: Signer,
  provider: providers.Provider,
) {
  const rawTx = transaction;
  rawTx.nonce = await signer.getTransactionCount();
  rawTx.gasPrice = (await provider.getGasPrice()).mul(2);
  const signedTx = await signer.signTransaction(rawTx);
  const receipt = await provider.sendTransaction(signedTx);
  await receipt.wait();
}

export async function signMessage(
  {
    domain,
    types,
    value,
  }: { domain: TypedDataDomain; types: any; value: Record<string, any> },
  signer: Wallet,
): Promise<string> {
  // eslint-disable-next-line
  return signer._signTypedData(domain, types, value);
}


// Sign and submit all transaction actions. Collect and return all signatures from signable actions.
export async function actionAll(
  actions: orderbook.Action[],
  wallet: Wallet,
  provider: providers.Provider,
): Promise<string[]> {
  const signatures: string[] = [];
  for (const action of actions) {
    if (action.type === orderbook.ActionType.TRANSACTION) {
      await signAndSubmitTx(
        await (action.buildTransaction()),
        wallet,
        provider,
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
