'use client';
import { BiomeCombinedProviders, Stack } from '@biom3/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


export default function AppWrapper({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    const queryClient = new QueryClient()
    
    return (
      <div className="flex-container">
        <QueryClientProvider client={queryClient}>
          <BiomeCombinedProviders>
            <Stack alignItems="center">
              { children }
            </Stack>
          </BiomeCombinedProviders>
        </QueryClientProvider>
      </div>
    );
}