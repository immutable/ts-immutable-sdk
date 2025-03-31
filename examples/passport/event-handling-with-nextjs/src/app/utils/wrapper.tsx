'use client';
import { BiomeCombinedProviders, Stack } from '@biom3/react';

export default function AppWrapper({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <div className="min-h-screen bg-gray-50 flex-container">
          <BiomeCombinedProviders>
          <Stack
            alignItems="center"
            className="w-full p-4 md:p-8"
          >
          { children }
           </Stack>
          </BiomeCombinedProviders>
    </div>
    );
}