import { orderbook } from "@imtbl/sdk";
import { Web3Provider } from "@ethersproject/providers";

// #doc sign-and-submit-approval
export const signAndSubmitApproval = async (
  provider: Web3Provider,
  bid: orderbook.PrepareBidResponse,
): Promise<void> => {
  // get your user's Web3 wallet, e.g. MetaMask, Passport, etc
  const signer = await provider.getSigner();

  // If the user hasn't yet approved the Immutable Seaport contract to transfer assets from this
  // collection on their behalf they'll need to do so before they create an order
  const approvalActions = bid.actions.filter(
    (action): action is orderbook.TransactionAction =>
      action.type === orderbook.ActionType.TRANSACTION,
  );

  for (const approvalAction of approvalActions) {
    const unsignedTx = await approvalAction.buildTransaction();
    const receipt = await signer.sendTransaction(unsignedTx);
    await receipt.wait();
  }

  return;
};
// #enddoc sign-and-submit-approval

// #doc sign-bid
export const signBid = async (
  provider: Web3Provider,
  bid: orderbook.PrepareBidResponse,
): Promise<string> => {
  // get your user's Web3 wallet, e.g. MetaMask, Passport, etc
  const signer = await provider.getSigner();

  // For an order to be created (and subsequently filled), Immutable needs a valid signature for the order data.
  // This signature is stored off-chain and is later provided to any user wishing to fulfil the open order.
  // The signature only allows the order to be fulfilled if it meets the conditions specified by the user that created the bid.
  const signableAction = bid.actions.find(
    (action): action is orderbook.SignableAction =>
      action.type === orderbook.ActionType.SIGNABLE,
  )!;

  const signature = await signer._signTypedData(
    signableAction.message.domain,
    signableAction.message.types,
    signableAction.message.value,
  );

  return signature;
};
// #enddoc sign-bid

// #doc create-bid
export const createBid = async (
  client: orderbook.Orderbook,
  preparedBid: orderbook.PrepareBidResponse,
  orderSignature: string,
  makerEcosystemFee?: {
    recipientAddress: string;
    amount: string;
  },
): Promise<string> => {
  const order = await client.createBid({
    orderComponents: preparedBid.orderComponents,
    orderHash: preparedBid.orderHash,
    orderSignature,
    // Optional maker marketplace fee
    makerFees: makerEcosystemFee ? [
      {
        recipientAddress: makerEcosystemFee.recipientAddress, // Replace address with your own marketplace address
        amount: makerEcosystemFee.amount,
      },
    ] : [],
  });
  return order.result.id;
};
// #enddoc create-bid
