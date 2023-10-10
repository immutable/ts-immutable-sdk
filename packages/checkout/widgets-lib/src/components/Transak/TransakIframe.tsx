import { useRef } from 'react';
import { TransakEventHandlers, useTransakEvents } from './useTransakEvents';

import {
  useTransakIframe,
  TransakWidgetType,
  TransakNFTCheckoutParams,
} from './useTransakIframe';
import { UserJourney } from '../../context/analytics-provider/SegmentAnalyticsProvider';

export type TransactionIframeProps = {
  id: string;
  type: TransakWidgetType;
  email: string;
  walletAddress: string;
  isPassportWallet: boolean;
} & TransakEventHandlers &
TransakNFTCheckoutParams;

export function TransakIframe({
  id,
  type,
  email,
  walletAddress,
  isPassportWallet,
  nftData,
  calldata,
  cryptoCurrencyCode,
  estimatedGasLimit,
  exchangeScreenTitle,
  smartContractAddress,
  partnerOrderId,
  onOpen,
  onOrderCreated,
  onOrderProcessing,
  onOrderCompleted,
  onOrderFailed,
}: TransactionIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useTransakEvents({
    userJourney: UserJourney.MINT,
    ref: iframeRef,
    email,
    userId: walletAddress,
    isPassportWallet,
    onOpen,
    onOrderCreated,
    onOrderProcessing,
    onOrderCompleted,
    onOrderFailed,
  });

  const { iframeSrc } = useTransakIframe({
    type,
    nftData,
    calldata,
    cryptoCurrencyCode,
    estimatedGasLimit,
    exchangeScreenTitle,
    smartContractAddress,
    email,
    walletAddress,
    partnerOrderId,
  });

  return (
    <iframe
      ref={iframeRef}
      id={id}
      src={iframeSrc}
      title="Transak-Iframe"
      allow="camera;microphone;fullscreen;payment"
      style={{
        height: '100%', width: '100%', border: 'none', position: 'absolute',
      }}
    />
  );
}
