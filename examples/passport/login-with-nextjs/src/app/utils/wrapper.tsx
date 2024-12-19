'use client';
import { BiomeCombinedProviders, Stack } from '@biom3/react';

export default function AppWrapper({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <div className="flex-container">
          <BiomeCombinedProviders>
          <Stack alignItems="center">
          { children }
           </Stack>
          </BiomeCombinedProviders>
    </div>
    );
}