import { useRef } from 'react';
import { Box } from '@biom3/react';

import { UserJourney } from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import {
  TransakEventHandlers,
  useTransakEvents,
} from '../hooks/useTransakEvents';

import {
  useTransakIframe,
  TransakWidgetType,
  TransakNFTCheckoutParams,
} from '../hooks/useTransakIframe';

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
    userJourney: UserJourney.PRIMARY_REVENUE,
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
    <Box
      style={{
        display: 'block',
        position: 'relative',
        maxWidth: '420px',
        height: '565px',
        borderRadius: 'base.borderRadius.x6',
        overflow: 'hidden',
        marginLeft: 'base.spacing.x2',
        marginRight: 'base.spacing.x2',
        marginBottom: 'base.spacing.x2',
      }}
    >
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
        }}
      />
    </Box>
  );
}
