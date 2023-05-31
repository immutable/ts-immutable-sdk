import {
  BiomeCombinedProviders, Body, Box, Button, Heading,
} from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import { ConnectionProviders } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { useState } from 'react';
import { diExampleWidgetStyle } from './DiExampleStyles';
import { WidgetTheme } from '../../../lib';

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
  const biomeTheme: BaseTokens = theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;

  function logProvider() {
    // TODO: Should this log be removed?
    // eslint-disable-next-line
    console.log('provider', provider);
    setNumLogs(numLogs + 1);
  }

  return (
    <BiomeCombinedProviders theme={{ base: biomeTheme }}>
      <Box sx={diExampleWidgetStyle}>
        <Heading>Example Widget</Heading>
        <br />
        <Button onClick={() => logProvider()}>Log Provider</Button>
        <br />
        <Body>
          Logged:
          {numLogs}
        </Body>
      </Box>
    </BiomeCombinedProviders>
  );
}
