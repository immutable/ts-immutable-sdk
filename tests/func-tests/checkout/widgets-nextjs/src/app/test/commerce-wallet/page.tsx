"use client";
import CommerceWallet from '../../commerce-wallet/page';
import { MockProvider } from '../../utils/mockProvider';
import { ProviderContextProvider } from '../../../contexts/ProviderContext';
import { Web3Provider } from '@ethersproject/providers';

export default function TestCommerceWallet() {
  const mockProvider = new MockProvider();

  return (
    <ProviderContextProvider provider={new Web3Provider(mockProvider)}>
      <CommerceWallet />
    </ProviderContextProvider>
  );
} 