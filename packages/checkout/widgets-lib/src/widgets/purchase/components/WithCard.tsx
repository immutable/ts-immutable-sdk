import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { WalletProviderRdns } from '@imtbl/checkout-sdk';
import { PurchaseContext } from '../context/PurchaseContext';
import { TransakIframe } from '../../../components/Transak/TransakIframe';
import { TransakNFTData } from '../../../components/Transak/TransakTypes';
import { useProvidersContext } from '../../../context/providers-context/ProvidersContext';

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
    purchaseState: {
      signResponse,
      quote,
    },
  } = useContext(PurchaseContext);

  const onFailedToLoad = () => { };

  const {
    providersState: {
      toProviderInfo,
      toAddress,
      checkout,
    },
  } = useProvidersContext();

  const recipientEmail = '';
  const recipientAddress = toAddress || '';
  const isPassportWallet = toProviderInfo?.rdns === WalletProviderRdns.PASSPORT;
  const excludeFiatCurrencies = [];
  const { environment } = checkout.config;
  const executeTxn = signResponse?.transactions.find((txn) => txn.methodCall.startsWith('execute'));

  const nftData: TransakNFTData[] = useMemo(
    () => (signResponse?.order.products ?? []).map((product) => ({
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

  if (!signResponse || !executeTxn) {
    return null;
  }

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
      excludeFiatCurrencies={excludeFiatCurrencies}
      onInit={onInit}
      onOpen={onOpen}
      onOrderCreated={onOrderCreated}
      onOrderProcessing={onOrderProcessing}
      onOrderCompleted={onOrderCompleted}
      onOrderFailed={onOrderFailed}
      onFailedToLoad={onFailedToLoad}
      environment={environment}
      contractId={quote?.quote.config.contractId || ''}
    />
  );
}
