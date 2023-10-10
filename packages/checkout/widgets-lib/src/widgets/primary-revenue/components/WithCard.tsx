import { useMemo } from 'react';

import { useSharedContext } from '../context/SharedContextProvider';
import { TransakIframe } from '../../../components/Transak/TransakIframe';
import { TransakNFTData } from '../../../components/Transak/TransakTypes';
import { text as textConfig } from '../../../resources/text/textConfig';
import { PrimaryRevenueWidgetViews } from '../../../context/view-context/PrimaryRevenueViewContextTypes';
import { MintErrorTypes } from '../types';

export type WithCardProps = {
  onInit: () => void;
};

export function WithCard({ onInit }: WithCardProps) {
  const { screenTitle, loading } = textConfig.views[PrimaryRevenueWidgetViews.PAY_WITH_CARD];

  const {
    recipientEmail, recipientAddress, isPassportWallet, signResponse, goToErrorView,
  } = useSharedContext();
  const executeTxn = signResponse?.transactions.find((txn) => txn.methodCall.startsWith('execute'));

  if (!signResponse || !executeTxn) {
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

  return (
    <TransakIframe
      id="transak-iframe"
      type="nft-checkout"
      email={recipientEmail}
      walletAddress={recipientAddress}
      isPassportWallet={isPassportWallet}
      loadingText={loading}
      exchangeScreenTitle={screenTitle}
      nftData={nftData}
      calldata={executeTxn.rawData}
      cryptoCurrencyCode={signResponse.order.currency.name}
      estimatedGasLimit={executeTxn.gasEstimate}
      smartContractAddress={executeTxn.contractAddress}
      partnerOrderId={executeTxn.params.reference}
      onInit={onInit}
      onFailedToLoad={() => goToErrorView(MintErrorTypes.TRANSAK_FAILED)}
    />
  );
}
