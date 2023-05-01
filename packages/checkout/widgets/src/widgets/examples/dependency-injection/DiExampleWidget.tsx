import { BiomeThemeProvider, Body, Box, Button, Heading } from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import { WidgetTheme } from '@imtbl/checkout-ui-types';
import { DiExampleWidgetStyle } from './DiExampleStyles';
import { ConnectionProviders } from '@imtbl/checkout-sdk-web';
import { Web3Provider } from '@ethersproject/providers';
import { useState } from 'react';

export interface ExampleWidgetProps {
  params: ExampleWidgetParams;
  theme: WidgetTheme;
}

export interface ExampleWidgetParams {
  providerPreference?: ConnectionProviders;
  fromContractAddress?: string;
  fromNetwork?: string;
  amount?: string;
  provider?: Web3Provider;
}

export function ExampleWidget(props: ExampleWidgetProps) {
  const { params, theme } = props;
  const { provider } = params;
  const [numLogs, setNumLogs] = useState(0);
  const biomeTheme: BaseTokens =
    theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
      ? onLightBase
      : onDarkBase;

  function logProvider() {
    console.log('provider', provider);
    setNumLogs(numLogs + 1);
  }

  return (
    <BiomeThemeProvider theme={{ base: biomeTheme }}>
      <Box sx={DiExampleWidgetStyle}>
        <Heading>Example Widget</Heading>
        <br />
        <Button onClick={logProvider}>Log Provider</Button>
        <br />
        <Body>Logged: {numLogs}</Body>
      </Box>
    </BiomeThemeProvider>
  );
}
