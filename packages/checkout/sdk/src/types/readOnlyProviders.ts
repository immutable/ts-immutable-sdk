import { JsonRpcProvider } from '@ethersproject/providers';
import { ChainId } from './chainId';

export interface GetReadOnlyProvidersResult {
  providers: Map<ChainId, JsonRpcProvider>;
}
