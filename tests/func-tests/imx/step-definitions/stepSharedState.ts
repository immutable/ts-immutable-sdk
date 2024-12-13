import {
  createStarkSigner,
  WalletConnection,
  UnsignedOrderRequest,
  Balance,
  CreateTransferResponseV1,
  CreateWithdrawalResponse,
  MintResultDetails,
} from '@imtbl/sdk/x';
import { Environment, ImmutableConfiguration } from '@imtbl/sdk/config';
import { env, getProvider } from '../common';
import genericErc20Abi from '../abi/ERC20.json';
import { Contract, JsonRpcProvider, Wallet } from 'ethers';

const provider = getProvider(env.network, env.alchemyApiKey);

// export const configuration = Config.SANDBOX;
export const configuration = new ImmutableConfiguration({ environment: Environment.SANDBOX });
// export const oldConfig = Config.SANDBOX;

/**
 * Generate a ethSigner/starkSigner object from a private key.
 */
const generateWalletConnection = async (
  privateKey: string,
  starkPrivateKey: string,
  rpcProvider: JsonRpcProvider,
): Promise<WalletConnection> => {
  if (!privateKey) {
    throw new Error('PrivateKey required!');
  }

  // L1 credentials
  const ethSigner = new Wallet(privateKey).connect(rpcProvider);

  // L2 credentials
  const starkSigner = createStarkSigner(starkPrivateKey);

  return {
    ethSigner,
    starkSigner,
  };
};

export class StepSharedState {
  private minter?: WalletConnection;

  private banker?: WalletConnection;

  users: {
    [key: string]: WalletConnection;
  } = {};

  nfts: {
    [key: string]: {
      type: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        MINTABLE_ERC721: 'MINTABLE_ERC721';
      };
      data: {
        id: string;
        blueprint: string;
        // eslint-disable-next-line @typescript-eslint/naming-convention
        token_address: string;
        royalties: {
          recipient: string;
          percentage: number;
        }[];
      };
    };
  } = {};

  orders: {
    [key: string]: UnsignedOrderRequest & {
      orderId: number;
    };
  } = {};

  trades: {
    [key: string]: {
      tradeId: number;
      status: string;
    };
  } = {};

  // Todo: define token type
  tokens: { [key: string]: MintResultDetails } = {};

  transfers: { [key: string]: CreateTransferResponseV1 } = {};

  // exchangeTransfers: { [key: string]: CreateTransferResponseV1 } = {};

  // nftPrimaryTransaction: { [key: string]: NftprimarytransactionCreateResponse } = {};

  // transferV2: { [key: string]: CreateTransferResponse } = {};

  // balances: { [key: string]: Balance } = {};

  bankerBalances: { [key: string]: Balance } = {};

  burns: { [key: string]: CreateTransferResponseV1 } = {};

  withdrawals: { [key: string]: CreateWithdrawalResponse } = {};

  // nftSecondaryTransactions: {
  //   [key: string]: NftsecondarytransactionCreateResponse
  // } = {};

  public async getMinter(): Promise<WalletConnection> {
    if (this.minter !== undefined) {
      return this.minter;
    }
    const privateKey = env.privateKey1;
    const walletConnection = await generateWalletConnection(
      privateKey,
      env.starkPrivateKey1,
      provider,
    );

    this.minter = walletConnection;
    return this.minter;
  }

  public async getBanker(): Promise<WalletConnection> {
    if (this.banker !== undefined) {
      return this.banker;
    }

    const privateKey = env.privateKeyBanker;
    const walletConnection = await generateWalletConnection(
      privateKey,
      env.starkPrivateKeyBanker,
      provider,
    );

    this.banker = walletConnection;

    return this.banker;
  }

  static getTokenAddress(symbol: string): string {
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
    const token = tokenAddresses.find((t) => t.symbol === symbol);
    return token?.tokenAddress || '';
  }

  static getTokenContract(symbol: string) {
    const tokenAddress = StepSharedState.getTokenAddress(symbol);
    const contract = new Contract(
      tokenAddress,
      genericErc20Abi,
      provider,
    );
    return contract;
  }

  static getProvider() {
    return provider;
  }
}
