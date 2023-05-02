import { BiomeThemeProvider, Body, Box, Heading } from '@biom3/react';
import {
  Checkout,
  ConnectResult,
  GetTokenAllowListResult,
  TokenFilterTypes,
  TokenInfo,
} from '@imtbl/checkout-sdk';
import {
  ConnectionProviders,
  WidgetTheme,
} from '@imtbl/checkout-widgets-react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import { SwapForm } from './components/SwapForm';
import { SwapWidgetStyle } from './SwapStyles';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { sendSwapSuccessEvent, sendSwapFailedEvent } from './SwapWidgetEvents';

export enum SwapWidgetViews {
  SWAP = 'SWAP',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
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
  const [allowedTokens, setAllowedTokens] = useState<TokenInfo[]>([]);
  const [view, setView] = useState(SwapWidgetViews.SWAP);
  const { params, theme } = props;
  const { amount, fromContractAddress, toContractAddress, providerPreference } =
    params;
  const biomeTheme: BaseTokens =
    theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
      ? onLightBase
      : onDarkBase;
  const checkout = useMemo(() => new Checkout(), []);
  const connectToCheckout = useCallback(async () => {
    const result =
      providerPreference &&
      (await checkout.connect({
        providerPreference,
      }));
    if (result) {
      setConnection(result);
      const allowList: GetTokenAllowListResult =
        await checkout.getTokenAllowList(
          { chainId: 1, type: TokenFilterTypes.SWAP } // TODO: THIS NEEDS TO BE CHANGED BACK TO THE NETWORK CHAIN ID
        );
      setAllowedTokens(allowList.tokens);
    }
  }, [checkout, providerPreference]);

  useEffect(() => {
    connectToCheckout();
  }, [connectToCheckout]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateView = async (view: SwapWidgetViews, err?: any) => {
    setView(view);
    if (view === SwapWidgetViews.SUCCESS) {
      sendSwapSuccessEvent();
      return;
    }
    if (view === SwapWidgetViews.FAIL) {
      sendSwapFailedEvent(err.message);
      return;
    }
  };

  const renderSwapForm = () => {
    if (!connection) return;
    return (
      <SwapForm
        allowedTokens={allowedTokens}
        amount={amount}
        fromContractAddress={fromContractAddress}
        toContractAddress={toContractAddress}
        connection={connection}
        updateView={updateView}
      />
    );
  };

  const renderSuccess = () => {
    return <Body>Success</Body>;
  };

  const renderFailure = () => {
    return <Body>Failure</Body>;
  };

  return (
    <BiomeThemeProvider theme={{ base: biomeTheme }}>
      <Box sx={SwapWidgetStyle}>
        <Heading size={'medium'}>Swap Widget</Heading>
        {view === SwapWidgetViews.SWAP && renderSwapForm()}
        {view === SwapWidgetViews.SUCCESS && renderSuccess()}
        {view === SwapWidgetViews.FAIL && renderFailure()}
      </Box>
    </BiomeThemeProvider>
  );
}
