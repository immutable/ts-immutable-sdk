import { useRef } from 'react';
import { TransakEventHandlers, useTransakEvents } from './useTransakEvents';

import {
  useTransakIframe,
  TransakWidgetType,
  TransakNFTCheckoutParams,
} from './useTransakIframe';
import { UserJourney } from '../../context/analytics-provider/SegmentAnalyticsProvider';
import { CenteredBoxContent } from '../CenteredBoxContent/CenteredBoxContent';
import { LoadingBox } from '../../views/loading/LoadingBox';

export type TransactionIframeProps = {
  id: string;
  type: TransakWidgetType;
  email: string;
  walletAddress: string;
  isPassportWallet: boolean;
  loadingText: string;
} & TransakEventHandlers &
TransakNFTCheckoutParams;

export function TransakIframe(props: TransactionIframeProps) {
  const {
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
    onInit,
    onOrderCreated,
    onOrderProcessing,
    onOrderCompleted,
    onOrderFailed,
    onFailedToLoad,
    failedToLoadTimeoutInMs,
    loadingText,
  } = props;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { onLoad, initialised } = useTransakEvents({
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
    onInit,
    failedToLoadTimeoutInMs,
    onFailedToLoad,
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
    <>
      {!initialised && (
        <CenteredBoxContent testId="loading-view">
          <LoadingBox loadingText={loadingText} />
        </CenteredBoxContent>
      )}
      <iframe
        ref={iframeRef}
        id={id}
        src={iframeSrc}
        title="Transak-Iframe"
        allow="camera;microphone;fullscreen;payment"
        style={{
          height: '100%',
          width: '100%',
          border: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          opacity: initialised ? 1 : 0,
          transition: 'opacity 0.5s ease-out',
        }}
        onLoad={onLoad}
        onError={() => onFailedToLoad?.()}
      />
    </>
  );
}
