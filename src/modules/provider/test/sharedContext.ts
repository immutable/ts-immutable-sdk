import { Wallet } from '@ethersproject/wallet';
import {
  Config,
  CreateWithdrawalResponse,
  CreateTransferResponseV1,
  Balance,
  CreateTransferResponse,
  MintResultDetails,
  UnsignedOrderRequest,
  createStarkSigner,
  NftprimarytransactionCreateResponse, ImmutableXConfiguration
} from "@imtbl/core-sdk";
import { env } from './common';
import { AlchemyProvider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import genericErc20Abi from './abi/ERC20.json';
import { Signers } from '../signable-actions/types';

const provider = new AlchemyProvider(env.network, env.alchemyApiKey);

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
    const privateKey = env.privateKey1;
    const signers = await generateSigners(
      privateKey,
      env.starkPrivateKey1,
      provider,
    );

    this.userOneSigners = signers;
    console.log(this.userOneSigners.starkExSigner)
    console.log(this.userOneSigners.ethSigner)
    return this.userOneSigners;
  }

  public async getUserTwoSigners(): Promise<Signers> {
    if (this.userTwoSigners !== undefined) {
      return this.userTwoSigners;
    }

    const privateKey = env.privateKeyBanker;
    const signers = await generateSigners(
      privateKey,
      env.starkPrivateKeyBanker,
      provider,
    );

    this.userTwoSigners = signers;

    return this.userTwoSigners;
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

  public getTokenContract(symbol: string) {
    const tokenAddress = this.getTokenAddress(symbol);
    const contract = new ethers.Contract(
      tokenAddress,
      genericErc20Abi,
      provider,
    );
    return contract;
  }

  public getProvider() {
    return provider;
  }
}

/**
 * Generate a ethSigner/starkSigner object from a private key.
 */
export const generateSigners = async (
  privateKey: string,
  starkPrivateKey: string,
  provider: AlchemyProvider,
): Promise<Signers> => {
  if (!privateKey) {
    throw new Error('PrivateKey required!');
  }

  // L1 credentials
  const ethSigner = new Wallet(privateKey).connect(provider);

  // L2 credentials
  const starkExSigner = createStarkSigner(starkPrivateKey);

  return {
    ethSigner,
    starkExSigner,
  } as Signers;
};

