/**
 * Minimal relayer client for Immutable relayer API
 */

import type { User } from '@imtbl/auth';
import { getEip155ChainId } from './utils/chain';
import { jsonRpcRequest } from './utils/http-client';
import { encodeAbiParameters } from 'viem';
import type { MetaTransaction } from './metatransaction';

export interface TypedDataPayload {
  types: {
    EIP712Domain: Array<{ name: string; type: string }>;
    [key: string]: Array<{ name: string; type: string }>;
  };
  domain: {
    name?: string;
    version?: string;
    chainId?: number | string;
    verifyingContract?: string;
    salt?: string;
  };
  primaryType: string;
  message: Record<string, any>;
}

export interface RelayerClientConfig {
  relayerUrl: string;
}

/**
 * Fee option from relayer
 */
export interface FeeOption {
  tokenPrice: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenAddress: string;
  recipientAddress: string;
}

/**
 * Minimal relayer client
 */
export class RelayerClient {
  private config: RelayerClientConfig;

  constructor(config: RelayerClientConfig) {
    this.config = config;
  }

  /**
   * Makes a request to the relayer API
   */
  private async request(method: string, params: any[], user: User): Promise<any> {
    // User is guaranteed to be authenticated when this is called
    // (ensured by ensureAuthenticated() in provider)
    // Keep defensive check here as final safety net
    if (!user?.access_token) {
      throw new Error('User not authenticated');
    }

    return jsonRpcRequest(
      `${this.config.relayerUrl}/v1/transactions`,
      method,
      params,
      user.access_token
    );
  }

  /**
   * Sends a transaction via relayer
   */
  async ethSendTransaction(to: string, data: string, chainId: number, user: User): Promise<string> {
    return this.request('eth_sendTransaction', [{
      to,
      data,
      chainId: getEip155ChainId(chainId),
    }], user);
  }

  /**
   * Gets transaction by hash
   */
  async imGetTransactionByHash(hash: string, user: User): Promise<any> {
    return this.request('im_getTransactionByHash', [hash], user);
  }

  /**
   * Signs a message via relayer
   */
  async imSign(address: string, message: string, chainId: number, user: User): Promise<string> {
    return this.request('im_sign', [{
      chainId: getEip155ChainId(chainId),
      address,
      message,
    }], user);
  }

  /**
   * Signs typed data via relayer
   */
  async imSignTypedData(address: string, payload: TypedDataPayload, chainId: number, user: User): Promise<string> {
    return this.request('im_signTypedData', [{
      chainId: getEip155ChainId(chainId),
      address,
      eip712Payload: payload,
    }], user);
  }

  /**
   * Gets fee options for a transaction
   */
  async imGetFeeOptions(userAddress: string, data: string, chainId: number, user: User): Promise<FeeOption[] | undefined> {
    return this.request('im_getFeeOptions', [{
      userAddress,
      data,
      chainId: getEip155ChainId(chainId),
    }], user);
  }

  /**
   * Gets fee option from relayer (prefers IMX)
   * Helper that selects IMX fee option from transactions
   */
  async getFeeOption(
    walletAddress: string,
    transactions: MetaTransaction[],
    chainId: number,
    user: User
  ): Promise<FeeOption> {
    const META_TRANSACTIONS_TYPE = `tuple(
      bool delegateCall,
      bool revertOnError,
      uint256 gasLimit,
      address target,
      uint256 value,
      bytes data
    )[]`;

    const encodedTransactions = encodeAbiParameters(
      [{ type: META_TRANSACTIONS_TYPE }],
      [transactions]
    );

    const feeOptions = await this.imGetFeeOptions(walletAddress, encodedTransactions, chainId, user);

    if (!feeOptions || !Array.isArray(feeOptions)) {
      throw new Error('Invalid fee options received from relayer');
    }

    const imxFeeOption = feeOptions.find(
      (feeOption) => feeOption.tokenSymbol === 'IMX'
    );
    
    if (!imxFeeOption) {
      throw new Error('Failed to retrieve fees for IMX token');
    }

    return imxFeeOption;
  }
}

