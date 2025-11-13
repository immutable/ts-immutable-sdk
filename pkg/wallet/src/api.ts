/**
 * Minimal API client for Passport APIs
 */

import type { User } from '@imtbl/auth';
import { getEip155ChainId } from './utils/chain';
import { authenticatedFetch } from './utils/http-client';

export interface ApiClientConfig {
  apiUrl: string;
}

/**
 * Minimal API client
 */
export class ApiClient {
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = config;
  }

  /**
   * Lists available chains
   */
  async listChains(): Promise<Array<{ id: string; name: string }>> {
    const data = await authenticatedFetch<{ result?: Array<{ id: string; name: string }> }>(
      `${this.config.apiUrl}/v1/chains`,
    );
    return data.result || [];
  }

  /**
   * Creates a counterfactual address (registers user)
   */
  async createCounterfactualAddress(
    chainName: string,
    ethereumAddress: string,
    ethereumSignature: string,
    user: User,
  ): Promise<string> {
    // User is guaranteed to be authenticated when this is called
    // (ensured by ensureAuthenticated() in provider)
    // Trust provider - use access_token directly

    const data = await authenticatedFetch<{ counterfactual_address: string }>(
      `${this.config.apiUrl}/v2/passport/${chainName}/counterfactual-address`,
      {
        method: 'POST',
        body: {
          ethereum_address: ethereumAddress,
          ethereum_signature: ethereumSignature,
        },
        token: user.access_token,
      },
    );
    return data.counterfactual_address;
  }

  /**
   * Gets chain name from chain ID
   */
  async getChainName(chainId: number): Promise<string> {
    const chains = await this.listChains();
    const eipChainId = getEip155ChainId(chainId);
    const chain = chains.find((c) => c.id === eipChainId);
    if (!chain) {
      throw new Error(`Chain ${chainId} not found`);
    }
    return chain.name;
  }
}
