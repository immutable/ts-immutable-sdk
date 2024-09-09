import {orderbook} from '@imtbl/sdk';

export const signAndSubmitApproval = async (
    provider: Web3Provider,
    listing: orderbook.PrepareListingResponse
): Promise<void> => {
    // get your user's Web3 wallet, e.g. MetaMask, Passport, etc
    const signer = provider.getSigner();

    // If the user hasn't yet approved the Immutable Seaport contract to transfer assets from this
    // collection on their behalf they'll need to do so before they create an order
    const approvalAction = listing.actions.find(
        (action): action is orderbook.TransactionAction =>
            action.type === orderbook.ActionType.TRANSACTION
    );

    if (approvalAction) {
        const unsignedTx = await approvalAction.buildTransaction();
        const receipt = await signer.sendTransaction(unsignedTx);
        await receipt.wait();
    }

    return;
}

export const signListing = async (
    provider: Web3Provider,
    listing: orderbook.PrepareListingResponse
): Promise<string> => {
    // get your user's Web3 wallet, e.g. MetaMask, Passport, etc
    const signer = provider.getSigner();

    // For an order to be created (and subsequently filled), Immutable needs a valid signature for the order data.
    // This signature is stored off-chain and is later provided to any user wishing to fulfil the open order.
    // The signature only allows the order to be fulfilled if it meets the conditions specified by the user that created the listing.
    const signableAction = listing.actions.find(
        (action): action is orderbook.SignableAction =>
            action.type === orderbook.ActionType.SIGNABLE
    )!;

    const signature = await signer._signTypedData(
        signableAction.message.domain,
        signableAction.message.types,
        signableAction.message.value
    );

    return signature;
}

export const createListing = async (
    client: orderbook.Orderbook,
    preparedListing: orderbook.PrepareListingResponse,
    orderSignature: string
): Promise<string> => {
    const order = await client.createListing({
        orderComponents: preparedListing.orderComponents,
        orderHash: preparedListing.orderHash,
        orderSignature,
        // Optional maker marketplace fee
        makerFees: [{
            amount: '100',
            recipientAddress: '0xFooBar', // Replace address with your own marketplace address
        }],
    });
    return order.result.id
};