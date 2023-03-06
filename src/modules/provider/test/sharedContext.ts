import { StarkSigner } from "@imtbl/core-sdk";
import { Signers } from '../signable-actions/types';

export const privateKey1 = "d90915fa5bce418a23184c9asdfasfasdf5c8e900e3035cf34e2dd36"
export const privateKey2 = "013fe4a5265bc6deb3f3b524b987sdf987f8c7a8ec2a998ae0512f493d763c8f"
export const configuration = {
  ethConfiguration: {
    chainID: 5
  },
  apiConfiguration: {
    "accessToken": undefined,
    "apiKey": undefined,
    "baseOptions": {
      "headers": {
        "x-sdk-version": "imx-core-sdk-ts-1.0.1",
      },
    },
    "basePath": "https://api.sandbox.x.immutable.com",
    "formDataCtor": undefined,
    "password": undefined,
    "username": undefined,
  }
};

export class SharedContext {
  userOneSigners?: Signers;
  userTwoSigners?: Signers;

  public async getUserOneSigners(): Promise<Signers> {
    if (this.userOneSigners !== undefined) {
      return this.userOneSigners;
    }
    const signers = await generateSigners(
      privateKey1,
    );

    this.userOneSigners = signers;

    return this.userOneSigners;
  }

  public getUserOnePrivateKey() {
    return privateKey1;
  }

  public async getUserTwoSigners(): Promise<Signers> {
    if (this.userTwoSigners !== undefined) {
      return this.userTwoSigners;
    }

    const signers = await generateSigners(
      privateKey2,
    );

    this.userTwoSigners = signers;

    return this.userTwoSigners;
  }

  public getUserTwoPrivateKey() {
    return privateKey2;
  }

  public getTokenAddress(symbol: string): string {
    const tokenAddresses = [
      {
        symbol: 'ETH',
        tokenAddress: 'ETH',
      },
      {
        symbol: 'FCT',
        tokenAddress: '0x73f99ca65b1a0aef2d4591b1b543d789860851bf',
      },
      {
        symbol: 'IMX',
        tokenAddress: '0x1facdd0165489f373255a90304650e15481b2c85', // IMX address in goerli
      },
    ];
    const token = tokenAddresses.find(token => token.symbol === symbol);
    return token?.tokenAddress || '';
  }
}

/**
 * Generate a ethSigner/starkSigner object from a private key.
 */
export const generateSigners = async (
  privateKey: string,
): Promise<Signers> => {
  if (!privateKey) {
    throw new Error('PrivateKey required!');
  }

  const ethKey = "ETH" + privateKey;
  const starkKey = "STX" + privateKey;

  // L1 credentials
  const ethSigner = {
    signMessage: async (message: string) => {
      return message + ethKey;
    },
    getAddress: async () => ethKey,
    getChainId: async () => 5
  }

  // L2 credentials
  const starkExSigner = {
    signMessage: async (message: string) => {
      return message + starkKey;
    },
    getAddress: () => starkKey,
  } as StarkSigner;

  return {
    ethSigner,
    starkExSigner,
  } as Signers;
};

