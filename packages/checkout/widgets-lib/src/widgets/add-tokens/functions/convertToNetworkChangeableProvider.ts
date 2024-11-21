import { WrappedBrowserProvider } from '@imtbl/checkout-sdk';

export const convertToNetworkChangeableProvider = async (
  provider: WrappedBrowserProvider,
): Promise<WrappedBrowserProvider> => new WrappedBrowserProvider(provider.ethereumProvider!, 'any');
