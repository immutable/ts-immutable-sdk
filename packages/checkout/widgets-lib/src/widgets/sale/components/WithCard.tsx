import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSaleContext } from '../context/SaleContextProvider';
import { TransakIframe } from '../../../components/Transak/TransakIframe';
import { TransakNFTData } from '../../../components/Transak/TransakTypes';
import { SaleErrorTypes } from '../types';

export interface WithCardProps {
  onInit?: (data: Record<string, unknown>) => void;
  onOpen?: (data: Record<string, unknown>) => void;
  onOrderCreated?: (data: Record<string, unknown>) => void;
  onOrderProcessing?: (data: Record<string, unknown>) => void;
  onOrderCompleted?: (data: Record<string, unknown>) => void;
  onOrderFailed?: (data: Record<string, unknown>) => void;
}

export function WithCard(props: WithCardProps) {
  const { t } = useTranslation();
  const {
    onInit,
    onOpen,
    onOrderCreated,
    onOrderProcessing,
    onOrderCompleted,
    onOrderFailed,
  } = props;
  const {
    recipientEmail,
    recipientAddress,
    isPassportWallet,
    signResponse,
    goToErrorView,
    environment,
    clientConfig,
  } = useSaleContext();
  const executeTxn = signResponse?.transactions.find((txn) => txn.methodCall.startsWith('execute'));

  if (!signResponse || !executeTxn) {
    return null;
  }

  const nftData: TransakNFTData[] = useMemo(
    () => signResponse.order.products.map((product) => ({
      collectionAddress: product.collectionAddress,
      imageURL: product.image,
      nftName: product.name,
      price: product.amount,
      quantity: product.qty,
      tokenID: product.tokenId,
      nftType: product.contractType || 'ERC721',
    })),
    [signResponse],
  );

  const onFailedToLoad = () => {
    goToErrorView(SaleErrorTypes.TRANSAK_FAILED);
  };

  return (
    <TransakIframe
      id="transak-iframe"
      type="nft-checkout"
      email={recipientEmail}
      walletAddress={recipientAddress}
      isPassportWallet={isPassportWallet}
      exchangeScreenTitle={t('views.PAY_WITH_CARD.screenTitle')}
      nftData={nftData}
      calldata={executeTxn.rawData}
      cryptoCurrencyCode={signResponse.order.currency.name}
      estimatedGasLimit={executeTxn.gasEstimate}
      partnerOrderId={executeTxn.params.reference}
      onInit={onInit}
      onOpen={onOpen}
      onOrderCreated={onOrderCreated}
      onOrderProcessing={onOrderProcessing}
      onOrderCompleted={onOrderCompleted}
      onOrderFailed={onOrderFailed}
      onFailedToLoad={onFailedToLoad}
      environment={environment}
      contractId={clientConfig.contractId}
    />
  );
}
