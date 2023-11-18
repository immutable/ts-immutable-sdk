import React from 'react';
import { BiomeCombinedProviders } from '@biom3/react';
import { BaseTokens, onDarkBase } from '@biom3/design-tokens';

export interface TestProps {
  children: React.ReactNode;
  theme?: BaseTokens
}

export function ViewContextTestComponent({ children, theme }: TestProps) {
  return (
    <BiomeCombinedProviders theme={{ base: theme ?? onDarkBase }}>
      {children}
    </BiomeCombinedProviders>
  );
}
