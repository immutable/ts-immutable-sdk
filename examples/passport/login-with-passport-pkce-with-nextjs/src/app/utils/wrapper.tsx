'use client';

import React from 'react';
import { BiomeCombinedProviders, Stack } from '@biom3/react';

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-container">
      <BiomeCombinedProviders>
        <Stack alignItems="center" gap="4">
          {children}
        </Stack>
      </BiomeCombinedProviders>
    </div>
  );
} 