/* eslint-disable no-console */
import { useCallback, useMemo } from 'react';

import { useSharedContext } from '../context/SharedContextProvider';
import { TransakIframe } from '../../../components/Transak/TransakIframe';
import { TransakNFTData } from '../../../components/Transak/TransakTypes';
import { text as textConfig } from '../../../resources/text/textConfig';
import { SaleWidgetViews } from '../../../context/view-context/SaleViewContextTypes';

export function WithCard() {
  const { screenTitle } = textConfig.views[SaleWidgetViews.PAY_WITH_CARD];

  const {
    recipientEmail, recipientAddress, isPassportWallet, signResponse,
  } = useSharedContext();
  const executeTxn = signResponse?.transactions.find((txn) => txn.methodCall.startsWith('execute'));

  if (!signResponse || !executeTxn) {
    // TODO: dispatch error
    return null;
  }

  const nftData: TransakNFTData[] = useMemo(
    () => signResponse.order.products.map((product) => ({
      collectionAddress: executeTxn?.contractAddress || '',
      imageURL: product.image,
      nftName: product.name,
      price: product.amount,
      quantity: product.qty,
      tokenID: product.tokenId,
      nftType: 'ERC721',
    })),
    [signResponse],
  );

  const onOpen = useCallback(() => {
    console.log('onOpen');
  }, []);

  const onOrderCreated = useCallback(() => {
    console.log('onOrderCreated');
  }, []);

  const onOrderProcessing = useCallback(() => {
    console.log('onOrderProcessing');
  }, []);

  const onOrderCompleted = useCallback(() => {
    console.log('onOrderCompleted');
  }, []);

  const onOrderFailed = useCallback(() => {
    console.log('onOrderFailed');
  }, []);

  return (

    <TransakIframe
      id="transak-iframe"
      type="nft-checkout"
      email={recipientEmail}
      walletAddress={recipientAddress}
      isPassportWallet={isPassportWallet}
      exchangeScreenTitle={screenTitle}
      nftData={nftData}
      calldata={executeTxn.rawData}
      cryptoCurrencyCode={signResponse.order.currency.name}
      estimatedGasLimit={executeTxn.gasEstimate}
      smartContractAddress={executeTxn.contractAddress}
      partnerOrderId={executeTxn.params.reference}
      onOpen={onOpen}
      onOrderCreated={onOrderCreated}
      onOrderProcessing={onOrderProcessing}
      onOrderCompleted={onOrderCompleted}
      onOrderFailed={onOrderFailed}
    />
  );
}
