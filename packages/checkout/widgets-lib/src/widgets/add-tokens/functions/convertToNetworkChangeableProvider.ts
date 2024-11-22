import { WrappedBrowserProvider } from '@imtbl/checkout-sdk';

export const convertToNetworkChangeableProvider = (
  provider: WrappedBrowserProvider,
): WrappedBrowserProvider => new WrappedBrowserProvider(provider.ethereumProvider!, 'any');
