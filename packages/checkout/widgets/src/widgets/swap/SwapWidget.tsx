import { BiomeThemeProvider, Body, Box, Heading } from '@biom3/react';
import { Checkout, ConnectResult } from '@imtbl/checkout-sdk-web';
import { ConnectionProviders, WidgetTheme } from '@imtbl/checkout-ui-types';
import { onDarkBase } from '@biom3/design-tokens';
import { SwapForm } from './components/SwapForm';
import { SwapWidgetStyle } from './SwapStyles';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { sendSwapSuccessEvent, sendSwapFailedEvent } from './SwapWidgetEvents';

export enum SwapWidgetViews {
  SWAP = "SWAP",
  SUCCESS = "SUCCESS",
  FAIL = "FAIL"
}

export interface SwapWidgetProps {
  params: SwapWidgetParams;
  theme: WidgetTheme;
}

export interface SwapWidgetParams {
  providerPreference: ConnectionProviders;
  amount?: string;
  fromContractAddress?: string;
  toContractAddress?: string;
}

export function SwapWidget(props: SwapWidgetProps) {
  const [connection, setConnection] = useState<ConnectResult>();
  const [view, setView] = useState(SwapWidgetViews.SWAP);
  const { params } = props;
  const { amount, fromContractAddress, toContractAddress, providerPreference } = params;
  const checkout = useMemo(() => new Checkout(), []);
  const connectToCheckout = useCallback(async () => {
    const result = providerPreference && await checkout.connect({
      providerPreference
    });
    result && setConnection(result);
  }, [checkout, providerPreference]);

  useEffect(() => {
    connectToCheckout();
  }, [connectToCheckout])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateView = async (view: SwapWidgetViews, err?: any) => {
    setView(view)
    if (view === SwapWidgetViews.SUCCESS) {
      sendSwapSuccessEvent()
      return
    }
    if (view === SwapWidgetViews.FAIL) {
      sendSwapFailedEvent(err.message);
      return
    }
  }

  const renderSwapForm = () => {
    if (!connection) return;
    return (
      <SwapForm
        amount={amount}
        fromContractAddress={fromContractAddress}
        toContractAddress={toContractAddress}
        connection={connection}
        updateView={updateView} />
    )
  }

  const renderSuccess = () => {
    return (
      <Body>Success</Body>
    )
  }

  const renderFailure = () => {
    return (
      <Body>Failure</Body>
    )
  }
  
  return (
    <BiomeThemeProvider theme={{ base: onDarkBase }}>
      <Box sx={SwapWidgetStyle}>
        <Heading size={'medium'}>Swap Widget</Heading>
        {view === SwapWidgetViews.SWAP && renderSwapForm()}
        {view === SwapWidgetViews.SUCCESS && renderSuccess()}
        {view === SwapWidgetViews.FAIL && renderFailure()}
      </Box>
    </BiomeThemeProvider>
  )
}
