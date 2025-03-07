"use client";
import CommerceWallet from '../../commerce-wallet/page';
import { MockProvider } from '../../utils/mockProvider';
import { ProviderContextProvider } from '../../../contexts/ProviderContext';
import { WrappedBrowserProvider } from '@imtbl/sdk/checkout';

export default function TestCommerceWallet() {
  const mockProvider = new MockProvider();

  return (
    <ProviderContextProvider provider={new WrappedBrowserProvider(mockProvider)}>
      <CommerceWallet />
    </ProviderContextProvider>
  );
} 